import React, { useState, useRef } from "react";
import { addAssignment } from "../data/createdContentStore.js";
import { api } from "../api/client.js";

// Always try the live API first (api client defaults to http://localhost:3001).
// Only fall back to the in-memory store when the network request fails, so
// dev mode without a running backend still works gracefully.
// TODO: Trim this list down to the most common file types.

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".zip",
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CreateAssignmentModal({ courseId, courses, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState("100");
  const [selectedCourseId, setSelectedCourseId] = useState(
    courseId ?? courses?.[0]?.id ?? null,
  );
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const effectiveCourseId = courseId ?? selectedCourseId;
  const showCourseSelect = !courseId && courses?.length > 1;

  // -------------------------------------------------------------------------
  // File handling
  // -------------------------------------------------------------------------
  const validateAndAddFiles = (newFiles) => {
    setFileError(null);
    const combined = [...files];
    for (const file of newFiles) {
      if (combined.length >= MAX_FILES) {
        setFileError(`Maximum ${MAX_FILES} files allowed`);
        break;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit`);
        continue;
      }
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(`"${file.name}" is not an allowed file type`);
        continue;
      }
      combined.push(file);
    }
    setFiles(combined);
  };

  const handleFileChange = (e) => {
    validateAndAddFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !effectiveCourseId) return;
    setError(null);
    setSaving(true);

    // Build a multipart FormData so files travel with the fields
    const formData = new FormData();
    formData.append("title", title.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (dueDate) formData.append("dueDate", new Date(dueDate).toISOString());
    if (points) formData.append("points", points);
    files.forEach((f) => formData.append("files", f));

    try {
      await api.createAssignmentForm(effectiveCourseId, formData);
      setToast(true);
      setTimeout(() => {
        setToast(false);
        onSaved?.();
        onClose();
      }, 600);
    } catch (err) {
      // Graceful offline fallback — store in memory if API unreachable
      if (
        err.message?.includes("Cannot reach") ||
        err.message?.includes("Failed to fetch")
      ) {
        addAssignment(effectiveCourseId, {
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          points: points ? parseInt(points, 10) : 100,
        });
        setToast(true);
        setTimeout(() => {
          setToast(false);
          onSaved?.();
          onClose();
        }, 600);
      } else {
        setError(err.message || "Failed to create assignment");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e) => e.target === e.currentTarget && onClose();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-assignment-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2
            id="create-assignment-title"
            className="text-lg font-semibold text-gray-900"
          >
            Add Assignment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* API error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Course selector */}
            {showCourseSelect && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={selectedCourseId ?? ""}
                  onChange={(e) => setSelectedCourseId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  required
                >
                  {courses?.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.code} – {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                placeholder="Assignment title"
                maxLength={200}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-y"
                placeholder="Assignment instructions..."
                maxLength={5000}
              />
            </div>

            {/* Due date + Points */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due date & time
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min={0}
                  max={10000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="100"
                />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments{" "}
                <span className="text-gray-400 font-normal">
                  (optional, max {MAX_FILES} files, {MAX_FILE_SIZE_MB} MB each)
                </span>
              </label>

              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    Click to upload
                  </span>{" "}
                  or drag & drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Word, Excel, PowerPoint, images, ZIP
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* File error */}
              {fileError && (
                <p className="mt-1 text-xs text-red-600">{fileError}</p>
              )}

              {/* File list */}
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <svg
                          className="w-4 h-4 text-gray-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="truncate text-gray-700">{f.name}</span>
                        <span className="text-gray-400 shrink-0">
                          {formatBytes(f.size)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 text-gray-400 hover:text-red-500 shrink-0"
                        aria-label={`Remove ${f.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
            >
              {saving ? "Creating…" : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium z-60">
          Assignment created
        </div>
      )}
    </div>
  );
}
