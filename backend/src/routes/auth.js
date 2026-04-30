import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
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
});

export default router;
