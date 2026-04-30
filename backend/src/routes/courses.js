import { Router } from "express";
import { query, param } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/courses?role=student|teacher
// ---------------------------------------------------------------------------
router.get(
  "/",
  authMiddleware,
  query("role")
    .optional()
    .isIn(["student", "teacher"])
    .withMessage('role must be "student" or "teacher"'),
  validate,
  async (req, res) => {
    try {
      const role = req.query.role === "teacher" ? "teacher" : "student";
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.userId, role },
        include: {
          course: {
            include: {
              _count: { select: { assignments: true } },
            },
          },
        },
      });

      const courses = enrollments.map((e) => ({
        id: e.course.id,
        code: e.course.code,
        name: e.course.name,
        professor: e.course.professor,
        color: e.course.color,
        term: e.course.term,
        assignments: e.course._count.assignments,
      }));

      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/courses/available?q=<search>
// ---------------------------------------------------------------------------
router.get(
  "/available",
  authMiddleware,
  query("q")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must be 100 characters or fewer"),
  validate,
  async (req, res) => {
    try {
      const enrolled = await prisma.enrollment.findMany({
        where: { userId: req.userId, role: "student" },
        select: { courseId: true },
      });
      const enrolledIds = new Set(enrolled.map((e) => e.courseId));

      const allCourses = await prisma.course.findMany({
        include: { _count: { select: { assignments: true } } },
      });

      const q = (req.query.q || "").toLowerCase().trim();
      let available = allCourses.filter((c) => !enrolledIds.has(c.id));
      if (q) {
        available = available.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (c.professor && c.professor.toLowerCase().includes(q)),
        );
      }

      res.json(
        available.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          professor: c.professor,
          color: c.color,
          term: c.term,
          assignments: c._count.assignments,
        })),
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch available courses" });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/courses/:id/enroll
// ---------------------------------------------------------------------------
router.post(
  "/:id/enroll",
  authMiddleware,
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Course ID is required")
    .isLength({ max: 50 })
    .withMessage("Course ID is invalid"),
  validate,
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) return res.status(404).json({ error: "Course not found" });

      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.userId, courseId } },
      });
      if (existing) return res.status(400).json({ error: "Already enrolled" });

      await prisma.enrollment.create({
        data: { userId: req.userId, courseId, role: "student" },
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to enroll" });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/courses/:id
// ---------------------------------------------------------------------------
router.get(
  "/:id",
  authMiddleware,
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Course ID is required")
    .isLength({ max: 50 })
    .withMessage("Course ID is invalid"),
  validate,
  async (req, res) => {
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId: req.userId, courseId: req.params.id },
        include: {
          course: {
            include: {
              assignments: true,
              modules: { orderBy: { order: "asc" } },
              announcements: true,
            },
          },
        },
      });

      if (!enrollment) {
        return res.status(404).json({ error: "Course not found" });
      }

      const c = enrollment.course;
      res.json({
        id: c.id,
        code: c.code,
        name: c.name,
        professor: c.professor,
        description: c.description,
        term: c.term,
        color: c.color,
        credits: 4,
        assignments: c.assignments.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate ? a.dueDate.toISOString() : null,
          points: a.points,
        })),
        modules: c.modules.map((m) => ({
          id: m.id,
          title: m.title,
          items: 0,
          completed: false,
        })),
        announcements: c.announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          postedAt: a.postedAt,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch course" });
    }
  },
);

export default router;
