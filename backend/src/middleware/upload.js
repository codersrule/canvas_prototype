/**
 * upload.js — multer configuration for assignment file attachments.
 *
 * Security controls:
 *  - Allowlisted MIME types only (no executables, no scripts)
 *  - 10 MB per file maximum
 *  - Max 5 files per request
 *  - Files stored on disk under uploads/ with a UUID name (original name is
 *    stored in the DB but never used as a filesystem path — prevents path
 *    traversal)
 *  - Upload directory is created automatically if it does not exist
 */

import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Upload directory — sits outside src/ so it survives hot-reloads
// ---------------------------------------------------------------------------
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Allowed MIME types — expand as needed, but never allow executables or scripts
// ---------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = new Set([
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

// ---------------------------------------------------------------------------
// Storage — UUID filenames prevent path traversal and collisions
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "");
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not allowed`), false);
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
}).array("files", MAX_FILES);

// Express error handler wrapper — converts multer errors to JSON 400 responses
export function handleUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
        });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ error: `Too many files. Maximum is ${MAX_FILES} per upload.` });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}

export { UPLOAD_DIR };
