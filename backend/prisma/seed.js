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
        courseId: course1.id,
        title: "Week 1: Introduction to Python",
        order: 1,
      },
      {
        courseId: course1.id,
        title: "Week 2: Variables and Data Types",
        order: 2,
      },
      { courseId: course1.id, title: "Week 3: Control Structures", order: 3 },
    ],
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
