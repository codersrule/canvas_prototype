import { Router } from "express";
import { query, param, body } from "express-validator";
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

// ---------------------------------------------------------------------------
// POST /api/courses/:id/assignments  (teacher only)
// ---------------------------------------------------------------------------
router.post(
  "/:id/assignments",
  authMiddleware,
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Course ID is required")
    .isLength({ max: 50 }),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be 200 characters or fewer"),
  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description too long"),
  body("dueDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("dueDate must be a valid ISO 8601 date")
    .toDate(),
  body("points")
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage("Points must be between 0 and 10000")
    .toInt(),
  validate,
  async (req, res) => {
    try {
      const courseId = req.params.id;

      // verify the requester is a teacher in this course
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.userId, courseId } },
      });
      if (!enrollment || enrollment.role !== "teacher") {
        return res
          .status(403)
          .json({ error: "Only course teachers can create assignments" });
      }

      const { title, description, dueDate, points } = req.body;
      const assignment = await prisma.assignment.create({
        data: {
          courseId,
          title,
          description: description || null,
          dueDate: dueDate || null,
          points: points ?? 100,
        },
      });

      res.status(201).json({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : null,
        points: assignment.points,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/courses/:id/announcements  (teacher only)
// ---------------------------------------------------------------------------
router.post(
  "/:id/announcements",
  authMiddleware,
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Course ID is required")
    .isLength({ max: 50 }),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be 200 characters or fewer"),
  body("content")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Content too long"),
  validate,
  async (req, res) => {
    try {
      const courseId = req.params.id;

      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.userId, courseId } },
      });
      if (!enrollment || enrollment.role !== "teacher") {
        return res
          .status(403)
          .json({ error: "Only course teachers can post announcements" });
      }

      const { title, content } = req.body;
      const announcement = await prisma.announcement.create({
        data: {
          courseId,
          title,
          content: content || null,
          authorId: req.userId,
        },
      });

      res.status(201).json({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        postedAt: announcement.postedAt.toISOString(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  },
);
