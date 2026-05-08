import { Router } from "express";
import { query, param, body } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  uploadMiddleware,
  handleUploadErrors,
  UPLOAD_DIR,
} from "../middleware/upload.js";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function requireEnrollment(userId, courseId, role = null) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return null;
  if (role && enrollment.role !== role) return null;
  return enrollment;
}

function mapComment(comment) {
  return {
    id: comment.id,
    author: comment.user.name,
    authorInitials: initials(comment.user.name),
    text: comment.text,
    postedAt: comment.postedAt,
    likes: comment.likes,
    replyCount: comment.replies?.length || 0,
    replies: (comment.replies || []).map(mapComment),
  };
}

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
// POST /api/courses/:id/assignments  (teacher only)
// Accepts multipart/form-data so files can be attached alongside fields.
// ---------------------------------------------------------------------------
router.post(
  "/:id/assignments",
  authMiddleware,
  // multer runs first — it parses multipart bodies and populates req.body + req.files
  (req, res, next) =>
    uploadMiddleware(req, res, (err) =>
      handleUploadErrors(err, req, res, next),
    ),
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
  // dueDate arrives as an ISO string or datetime-local string ("YYYY-MM-DDTHH:mm") —
  // validate it parses to a real date rather than enforcing strict ISO 8601 format.
  body("dueDate")
    .optional({ checkFalsy: true })
    .custom((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) throw new Error("dueDate must be a valid date");
      return true;
    }),
  // points arrives as a string from FormData — validate as numeric string, coerce in handler
  body("points")
    .optional({ checkFalsy: true })
    .custom((val) => {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0 || n > 10000)
        throw new Error("Points must be between 0 and 10000");
      return true;
    }),
  validate,
  async (req, res) => {
    const uploadedFiles = req.files || [];
    try {
      const courseId = req.params.id;

      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.userId, courseId } },
      });
      if (!enrollment || enrollment.role !== "teacher") {
        // clean up any uploaded files before rejecting
        uploadedFiles.forEach((f) => fs.unlink(f.path, () => {}));
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
          points: points != null ? Number(points) : 100,
          files: uploadedFiles.length
            ? {
                create: uploadedFiles.map((f) => ({
                  originalName: f.originalname,
                  storedName: f.filename,
                  mimeType: f.mimetype,
                  sizeBytes: f.size,
                })),
              }
            : undefined,
        },
        include: { files: true },
      });

      res.status(201).json({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : null,
        points: assignment.points,
        files: assignment.files.map((f) => ({
          id: f.id,
          name: f.originalName,
          size: f.sizeBytes,
          url: `/api/files/${f.id}`,
        })),
      });
    } catch (err) {
      // clean up orphaned uploads on DB failure
      uploadedFiles.forEach((f) => fs.unlink(f.path, () => {}));
      console.error(err);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/files/:id — serve an uploaded assignment file
// ---------------------------------------------------------------------------
router.get(
  "/files/:fileId",
  authMiddleware,
  param("fileId").trim().notEmpty().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const file = await prisma.assignmentFile.findUnique({
        where: { id: req.params.fileId },
        include: {
          assignment: {
            include: { course: { include: { enrollments: true } } },
          },
        },
      });
      if (!file) return res.status(404).json({ error: "File not found" });

      // only enrolled users can download
      const enrolled = file.assignment.course.enrollments.some(
        (e) => e.userId === req.userId,
      );
      if (!enrolled) return res.status(403).json({ error: "Access denied" });

      const filePath = path.join(UPLOAD_DIR, file.storedName);
      if (!fs.existsSync(filePath))
        return res.status(404).json({ error: "File not found on disk" });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      );
      res.setHeader("Content-Type", file.mimeType);
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to serve file" });
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

// ---------------------------------------------------------------------------
// GET /api/courses/:id/people
// ---------------------------------------------------------------------------
router.get(
  "/:id/people",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id);
      if (!enrollment) return res.status(404).json({ error: "Course not found" });

      const people = await prisma.enrollment.findMany({
        where: { courseId: req.params.id },
        include: { user: true },
        orderBy: { role: "desc" },
      });

      res.json(
        people.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          role: p.role,
          initials: initials(p.user.name),
        })),
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch people" });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/courses/:id/files
// ---------------------------------------------------------------------------
router.get(
  "/:id/files",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id);
      if (!enrollment) return res.status(404).json({ error: "Course not found" });

      const [courseFiles, assignments] = await Promise.all([
        prisma.courseFile.findMany({
          where: { courseId: req.params.id },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.assignment.findMany({
          where: { courseId: req.params.id },
          include: { files: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      res.json([
        ...courseFiles.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          folder: f.folder,
          url: f.url,
          updatedAt: f.updatedAt,
        })),
        ...assignments.flatMap((a) =>
          a.files.map((f) => ({
            id: f.id,
            name: f.originalName,
            type: f.mimeType,
            size: `${Math.ceil(f.sizeBytes / 1024)} KB`,
            folder: a.title,
            url: `/api/files/${f.id}`,
            updatedAt: f.uploadedAt,
          })),
        ),
      ]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/courses/:id/discussions
// ---------------------------------------------------------------------------
router.get(
  "/:id/discussions",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id);
      if (!enrollment) return res.status(404).json({ error: "Course not found" });

      const discussions = await prisma.discussion.findMany({
        where: { courseId: req.params.id },
        include: { _count: { select: { comments: true } } },
        orderBy: { postedAt: "desc" },
      });

      res.json(
        discussions.map((d) => ({
          id: d.id,
          courseId: d.courseId,
          title: d.title,
          content: d.content,
          author: d.author,
          postedAt: d.postedAt,
          replies: d._count.comments,
        })),
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch discussions" });
    }
  },
);

router.get(
  "/:id/discussions/:discussionId",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  param("discussionId").trim().notEmpty().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id);
      if (!enrollment) return res.status(404).json({ error: "Course not found" });

      const discussion = await prisma.discussion.findFirst({
        where: { id: req.params.discussionId, courseId: req.params.id },
        include: {
          comments: {
            where: { parentId: null },
            include: {
              user: true,
              replies: {
                include: { user: true, replies: { include: { user: true } } },
                orderBy: { postedAt: "asc" },
              },
            },
            orderBy: { postedAt: "desc" },
          },
        },
      });
      if (!discussion) return res.status(404).json({ error: "Discussion not found" });

      res.json({
        id: discussion.id,
        courseId: discussion.courseId,
        title: discussion.title,
        content: discussion.content,
        author: discussion.author,
        postedAt: discussion.postedAt,
        comments: discussion.comments.map(mapComment),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch discussion" });
    }
  },
);

router.post(
  "/:id/discussions/:discussionId/comments",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  param("discussionId").trim().notEmpty().isLength({ max: 50 }),
  body("text").trim().notEmpty().isLength({ max: 5000 }),
  body("parentId").optional({ checkFalsy: true }).isString().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id);
      if (!enrollment) return res.status(404).json({ error: "Course not found" });

      const discussion = await prisma.discussion.findFirst({
        where: { id: req.params.discussionId, courseId: req.params.id },
      });
      if (!discussion) return res.status(404).json({ error: "Discussion not found" });

      const comment = await prisma.discussionComment.create({
        data: {
          discussionId: req.params.discussionId,
          userId: req.userId,
          text: req.body.text,
          parentId: req.body.parentId || null,
        },
        include: { user: true, replies: { include: { user: true } } },
      });

      res.status(201).json(mapComment(comment));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to post comment" });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/courses/:id/assignments/:assignmentId/submission
// ---------------------------------------------------------------------------
router.post(
  "/:id/assignments/:assignmentId/submission",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  param("assignmentId").trim().notEmpty().isLength({ max: 50 }),
  body("text").optional({ checkFalsy: true }).isString().isLength({ max: 10000 }),
  body("fileName").optional({ checkFalsy: true }).isString().isLength({ max: 255 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id, "student");
      if (!enrollment) return res.status(403).json({ error: "Only enrolled students can submit" });

      const assignment = await prisma.assignment.findFirst({
        where: { id: req.params.assignmentId, courseId: req.params.id },
      });
      if (!assignment) return res.status(404).json({ error: "Assignment not found" });

      const submission = await prisma.submission.upsert({
        where: {
          userId_assignmentId: {
            userId: req.userId,
            assignmentId: req.params.assignmentId,
          },
        },
        update: {
          text: req.body.text || null,
          fileName: req.body.fileName || null,
          submittedAt: new Date(),
        },
        create: {
          userId: req.userId,
          assignmentId: req.params.assignmentId,
          text: req.body.text || null,
          fileName: req.body.fileName || null,
        },
        include: { grade: true },
      });

      res.json({
        id: submission.id,
        text: submission.text,
        fileName: submission.fileName,
        submittedAt: submission.submittedAt,
        grade: submission.grade?.grade ?? null,
        feedback: submission.grade?.feedback ?? null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to submit assignment" });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/courses/:id/analytics
// ---------------------------------------------------------------------------
router.get(
  "/:id/analytics",
  authMiddleware,
  param("id").trim().notEmpty().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const enrollment = await requireEnrollment(req.userId, req.params.id, "teacher");
      if (!enrollment) return res.status(403).json({ error: "Only course teachers can view analytics" });

      const [students, assignments, graded] = await Promise.all([
        prisma.enrollment.count({ where: { courseId: req.params.id, role: "student" } }),
        prisma.assignment.findMany({
          where: { courseId: req.params.id },
          include: { submissions: true },
        }),
        prisma.grade.findMany({
          where: { submission: { assignment: { courseId: req.params.id } } },
        }),
      ]);

      const averageGrade =
        graded.length > 0
          ? graded.reduce((sum, g) => sum + g.grade, 0) / graded.length
          : 0;
      const totalPossibleSubmissions = assignments.length * students;
      const submitted = assignments.reduce((sum, a) => sum + a.submissions.length, 0);
      const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      graded.forEach((g) => {
        if (g.grade >= 90) distribution.A += 1;
        else if (g.grade >= 80) distribution.B += 1;
        else if (g.grade >= 70) distribution.C += 1;
        else if (g.grade >= 60) distribution.D += 1;
        else distribution.F += 1;
      });

      res.json({
        totalStudents: students,
        activeStudents: students,
        averageGrade: Number(averageGrade.toFixed(1)),
        assignmentCompletion:
          totalPossibleSubmissions > 0
            ? Math.round((submitted / totalPossibleSubmissions) * 100)
            : 0,
        attendanceRate: 0,
        gradeDistribution: distribution,
        upcomingDeadlines: assignments.map((a) => ({
          assignment: a.title,
          assignmentId: a.id,
          dueDate: a.dueDate,
          submitted: a.submissions.length,
          total: students,
        })),
        performanceMetrics: {
          submissionRate:
            totalPossibleSubmissions > 0
              ? Math.round((submitted / totalPossibleSubmissions) * 100)
              : 0,
          lateSubmissions: 0,
          resubmissions: 0,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch analytics" });
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
              assignments: {
                include: {
                  files: true,
                  submissions: {
                    where: { userId: req.userId },
                    include: { grade: true },
                  },
                },
                orderBy: { dueDate: "asc" },
              },
              modules: {
                include: { items: { orderBy: { order: "asc" } } },
                orderBy: { order: "asc" },
              },
              announcements: { orderBy: { postedAt: "desc" } },
              discussions: {
                include: { _count: { select: { comments: true } } },
                orderBy: { postedAt: "desc" },
              },
              files: { orderBy: { updatedAt: "desc" } },
              enrollments: { include: { user: true } },
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
          submitted: a.submissions.length > 0,
          submission: a.submissions[0]
            ? {
                id: a.submissions[0].id,
                text: a.submissions[0].text,
                fileName: a.submissions[0].fileName,
                submittedAt: a.submissions[0].submittedAt,
              }
            : null,
          grade: a.submissions[0]?.grade?.grade ?? null,
          feedback: a.submissions[0]?.grade?.feedback ?? null,
          files: a.files.map((f) => ({
            id: f.id,
            name: f.originalName,
            size: f.sizeBytes,
            url: `/api/files/${f.id}`,
          })),
        })),
        modules: c.modules.map((m) => ({
          id: m.id,
          title: m.title,
          items: m.items.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            url: item.url,
          })),
          completed: false,
        })),
        announcements: c.announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          postedAt: a.postedAt,
        })),
        discussions: c.discussions.map((d) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          author: d.author,
          postedAt: d.postedAt,
          replies: d._count.comments,
        })),
        files: c.files.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          folder: f.folder,
          url: f.url,
          updatedAt: f.updatedAt,
        })),
        people: c.enrollments.map((e) => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          role: e.role,
          initials: initials(e.user.name),
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch course" });
    }
  },
);

export default router;
