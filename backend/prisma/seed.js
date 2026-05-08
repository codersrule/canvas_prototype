import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const teacherPassword = await bcrypt.hash("password123", 10);
  const studentPassword = await bcrypt.hash("password123", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "prof.chen@classroom.edu" },
    update: {},
    create: {
      email: "prof.chen@classroom.edu",
      password: teacherPassword,
      name: "Prof. Sarah Chen",
      role: "teacher",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "sadiq@classroom.edu" },
    update: {},
    create: {
      email: "sadiq@classroom.edu",
      password: studentPassword,
      name: "Sadiq Haruna",
      role: "student",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "alice@classroom.edu" },
    update: {},
    create: {
      email: "alice@classroom.edu",
      password: studentPassword,
      name: "Alice Johnson",
      role: "student",
    },
  });

  const course1 = await prisma.course.upsert({
    where: { id: "ics31" },
    update: {},
    create: {
      id: "ics31",
      code: "ICS 31",
      name: "Introduction to Programming",
      professor: "Prof. Pattis",
      description:
        "An introduction to the fundamentals of computer programming using Python.",
      term: "Fall 2025",
      color: "from-blue-500 to-blue-600",
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: "math2d" },
    update: {},
    create: {
      id: "math2d",
      code: "MATH 2D",
      name: "Multivariable Calculus",
      professor: "Prof. Smith",
      description: "Vectors, partial derivatives, multiple integrals.",
      term: "Fall 2025",
      color: "from-green-500 to-green-600",
    },
  });

  await prisma.course.upsert({
    where: { id: "writing39b" },
    update: {},
    create: {
      id: "writing39b",
      code: "WRITING 39B",
      name: "Critical Reading & Rhetoric",
      professor: "Prof. Johnson",
      description: "Academic writing and critical analysis.",
      term: "Fall 2025",
      color: "from-orange-500 to-orange-600",
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: teacher.id, courseId: course1.id },
    },
    update: {},
    create: {
      userId: teacher.id,
      courseId: course1.id,
      role: "teacher",
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student2.id, courseId: course1.id },
    },
    update: {},
    create: {
      userId: student2.id,
      courseId: course1.id,
      role: "student",
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: teacher.id, courseId: course2.id },
    },
    update: {},
    create: {
      userId: teacher.id,
      courseId: course2.id,
      role: "teacher",
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: course1.id },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course1.id,
      role: "student",
    },
  });

  await prisma.assignment.upsert({
    where: { id: "ics31-a1" },
    update: {},
    create: {
      id: "ics31-a1",
      courseId: course1.id,
      title: "Assignment 1: Variables and Expressions",
      description: "Complete the exercises on Python variables and data types.",
      dueDate: new Date("2025-10-15T23:59:00.000Z"),
      points: 100,
    },
  });

  await prisma.module.createMany({
    data: [
      {
        id: "ics31-m1",
        courseId: course1.id,
        title: "Week 1: Introduction to Python",
        order: 1,
      },
      {
        id: "ics31-m2",
        courseId: course1.id,
        title: "Week 2: Variables and Data Types",
        order: 2,
      },
      {
        id: "ics31-m3",
        courseId: course1.id,
        title: "Week 3: Control Structures",
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.moduleItem.createMany({
    data: [
      {
        id: "ics31-m1-i1",
        moduleId: "ics31-m1",
        title: "Read the syllabus",
        type: "page",
        order: 1,
      },
      {
        id: "ics31-m1-i2",
        moduleId: "ics31-m1",
        title: "Install Python",
        type: "assignment",
        order: 2,
      },
      {
        id: "ics31-m2-i1",
        moduleId: "ics31-m2",
        title: "Variables lecture notes",
        type: "page",
        order: 1,
      },
    ],
    skipDuplicates: true,
  });

  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { courseId: course1.id, title: "Welcome to ICS 31" },
  });
  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        courseId: course1.id,
        title: "Welcome to ICS 31",
        content:
          "Welcome to the course. Please review the syllabus and complete the first module.",
      },
    });
  }

  const existingDiscussion = await prisma.discussion.findFirst({
    where: { courseId: course1.id, title: "Week 1 Questions" },
  });
  const discussion =
    existingDiscussion ||
    (await prisma.discussion.create({
      data: {
        courseId: course1.id,
        title: "Week 1 Questions",
        content: "Use this thread for questions about the first week of class.",
        author: teacher.name,
      },
    }));

  const existingComment = await prisma.discussionComment.findFirst({
    where: { discussionId: discussion.id, userId: student2.id },
  });
  if (!existingComment) {
    await prisma.discussionComment.create({
      data: {
        discussionId: discussion.id,
        userId: student2.id,
        text: "Can we use VS Code for the first assignment?",
      },
    });
  }

  const existingFile = await prisma.courseFile.findFirst({
    where: { courseId: course1.id, name: "Syllabus.pdf" },
  });
  if (!existingFile) {
    await prisma.courseFile.create({
      data: {
        courseId: course1.id,
        name: "Syllabus.pdf",
        type: "pdf",
        size: "128 KB",
        folder: "Course Documents",
      },
    });
  }

  const existingGroup = await prisma.group.findFirst({
    where: { courseId: course1.id, name: "Project Group A" },
  });
  const group =
    existingGroup ||
    (await prisma.group.create({
      data: {
        courseId: course1.id,
        name: "Project Group A",
        description: "Database-backed project group for the course.",
      },
    }));
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: student.id } },
    update: {},
    create: { groupId: group.id, userId: student.id },
  });
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: student2.id } },
    update: {},
    create: { groupId: group.id, userId: student2.id },
  });

  const existingConversation = await prisma.conversation.findFirst({
    where: { subject: "Welcome to ICS 31" },
  });
  if (!existingConversation) {
    await prisma.conversation.create({
      data: {
        subject: "Welcome to ICS 31",
        courseId: course1.id,
        participants: {
          create: [{ userId: teacher.id }, { userId: student.id, unread: true }],
        },
        messages: {
          create: [
            {
              senderId: teacher.id,
              body: "Welcome to the course. Let me know if you have questions.",
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete:", {
    teacher: teacher.email,
    student: student.email,
    courses: 3,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
