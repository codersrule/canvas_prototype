import { Router } from "express";
import { body, param } from "express-validator";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { UPLOAD_DIR } from "../middleware/upload.js";

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

function formatDueDate(value) {
  if (!value) return "No due date";
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function enrolledCourseIds(userId, role = "student") {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, role },
    select: { courseId: true },
  });
  return enrollments.map((e) => e.courseId);
}

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const courseIds = await enrolledCourseIds(req.userId, "student");

    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: { _count: { select: { assignments: true } } },
      orderBy: { code: "asc" },
    });

    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: true,
        submissions: {
          where: { userId: req.userId },
          include: { grade: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    });

    const todos = assignments
      .filter((a) => a.submissions.length === 0)
      .map((a) => ({
        id: a.id,
        assignmentId: a.id,
        courseId: a.courseId,
        courseCode: a.course.code,
        title: a.title,
        dueDate: formatDueDate(a.dueDate),
      }));

    const announcements = await prisma.announcement.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true },
      orderBy: { postedAt: "desc" },
      take: 10,
    });

    res.json({
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            initials: initials(user.name),
          }
        : null,
      semester: courses[0]?.term || "",
      courses: courses.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        professor: c.professor,
        color: c.color,
        term: c.term,
        assignments: c._count.assignments,
      })),
      todos,
      announcements: announcements.map((a) => ({
        id: a.id,
        announcementId: a.id,
        courseId: a.courseId,
        courseCode: a.course.code,
        title: a.title,
        content: a.content,
        timestamp: a.postedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        read: false,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const roles = req.query.role === "teacher" ? ["teacher"] : ["student"];
    const courseIds = (
      await prisma.enrollment.findMany({
        where: { userId: req.userId, role: { in: roles } },
        select: { courseId: true },
      })
    ).map((e) => e.courseId);

    const [announcements, assignments] = await Promise.all([
      prisma.announcement.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: true },
        orderBy: { postedAt: "desc" },
        take: 5,
      }),
      prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

    res.json([
      ...announcements.map((a) => ({
        id: `announcement-${a.id}`,
        title: a.title,
        message: a.content || `${a.course.code} announcement`,
        timeAgo: a.postedAt.toLocaleDateString(),
        link: `/course/${a.courseId}/announcement/${a.id}`,
        read: false,
      })),
      ...assignments.map((a) => ({
        id: `assignment-${a.id}`,
        title: a.title,
        message: `${a.course.code} assignment due ${formatDueDate(a.dueDate)}`,
        timeAgo: formatDueDate(a.dueDate),
        link: `/course/${a.courseId}/assignment/${a.id}`,
        read: false,
      })),
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.get("/groups", authMiddleware, async (req, res) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.userId },
      include: {
        group: {
          include: {
            course: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    res.json(
      memberships.map(({ group }) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        courseId: group.courseId,
        course: group.course.code,
        members: group._count.members,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

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

      const enrolled = file.assignment.course.enrollments.some(
        (e) => e.userId === req.userId,
      );
      if (!enrolled) return res.status(403).json({ error: "Access denied" });

      const filePath = path.join(UPLOAD_DIR, file.storedName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

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

function mapConversation(row, userId) {
  const participant = row.participants.find((p) => p.userId === userId);
  const otherParticipants = row.participants
    .filter((p) => p.userId !== userId)
    .map((p) => p.user.name);
  const messages = row.messages.map((m) => ({
    id: m.id,
    sender: m.sender.name,
    body: m.body,
    date: m.createdAt,
  }));
  const last = messages[messages.length - 1];

  return {
    id: row.id,
    subject: row.subject,
    course: row.courseId,
    participants: otherParticipants.length ? otherParticipants : ["You"],
    preview: last?.body || "",
    date: last?.date || row.updatedAt,
    unread: participant?.unread || false,
    starred: participant?.starred || false,
    messages,
  };
}

router.get("/inbox", authMiddleware, async (req, res) => {
  try {
    const participantRows = await prisma.conversationParticipant.findMany({
      where: { userId: req.userId },
      include: {
        conversation: {
          include: {
            participants: { include: { user: true } },
            messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    res.json(
      participantRows.map((row) => mapConversation(row.conversation, req.userId)),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

router.patch(
  "/inbox/:id/read",
  authMiddleware,
  param("id").trim().notEmpty(),
  validate,
  async (req, res) => {
    try {
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: req.params.id,
            userId: req.userId,
          },
        },
        data: { unread: false },
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mark conversation as read" });
    }
  },
);

router.patch(
  "/inbox/:id/star",
  authMiddleware,
  param("id").trim().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: req.params.id,
            userId: req.userId,
          },
        },
      });
      if (!participant) return res.status(404).json({ error: "Conversation not found" });
      const updated = await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { starred: !participant.starred },
      });
      res.json({ starred: updated.starred });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update star" });
    }
  },
);

router.post(
  "/inbox/:id/messages",
  authMiddleware,
  param("id").trim().notEmpty(),
  body("body").trim().notEmpty().isLength({ max: 5000 }),
  validate,
  async (req, res) => {
    try {
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: req.params.id,
            userId: req.userId,
          },
        },
      });
      if (!participant) return res.status(404).json({ error: "Conversation not found" });

      const message = await prisma.message.create({
        data: {
          conversationId: req.params.id,
          senderId: req.userId,
          body: req.body.body,
        },
        include: { sender: true },
      });
      await prisma.conversation.update({
        where: { id: req.params.id },
        data: { updatedAt: new Date() },
      });
      await prisma.conversationParticipant.updateMany({
        where: { conversationId: req.params.id, userId: { not: req.userId } },
        data: { unread: true },
      });

      res.status(201).json({
        id: message.id,
        sender: message.sender.name,
        body: message.body,
        date: message.createdAt,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send message" });
    }
  },
);

export default router;
