import { Router } from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/auth/me — return the authenticated user's profile
// ---------------------------------------------------------------------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      ...user,
      initials: user.name
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
//
// Validation rules:
//   email    — must be a valid email address; normalised to lowercase
//   password — must be present and between 1–128 characters
//              (upper bound prevents oversized bcrypt payloads)
// ---------------------------------------------------------------------------
router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1, max: 128 })
    .withMessage("Password must be between 1 and 128 characters"),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      // Constant-time path: always run bcrypt even on unknown emails to
      // prevent user-enumeration via response-time differences.
      const dummyHash =
        "$2a$12$invalidhashpaddingtomatchbcryptlength000000000000000000000";
      const valid = user
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, dummyHash).then(() => false);

      if (!user || !valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          initials: user.name
            .split(/\s+/)
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  },
);

export default router;
