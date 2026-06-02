import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  // Clean existing data
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.class.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  await prisma.user.create({
    data: {
      email: "admin@school.com",
      password,
      name: "Admin",
      role: "admin",
    },
  });

  // Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: "ahmed@school.com",
      password,
      name: "Mr. Ahmed",
      role: "teacher",
      teacherProfile: {
        create: {
          teacherId: "TCH-2024-001",
          department: "Mathematics",
          phone: "+1 (555) 100-0001",
        },
      },
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: "sarah@school.com",
      password,
      name: "Ms. Sarah",
      role: "teacher",
      teacherProfile: {
        create: {
          teacherId: "TCH-2024-002",
          department: "Science",
          phone: "+1 (555) 100-0002",
        },
      },
    },
  });

  // Create Students
  const student1 = await prisma.user.create({
    data: {
      email: "alice@school.com",
      password,
      name: "Alice Williams",
      role: "student",
      studentProfile: {
        create: {
          grade: "10A",
          guardian: "Robert Williams",
          phone: "+1 (555) 200-0001",
          address: "123 Oak St, Cityville",
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "bob@school.com",
      password,
      name: "Bob Chen",
      role: "student",
      studentProfile: {
        create: {
          grade: "10A",
          guardian: "Lisa Chen",
          phone: "+1 (555) 200-0002",
          address: "456 Maple Ave, Cityville",
        },
      },
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: "carol@school.com",
      password,
      name: "Carol Martinez",
      role: "student",
      studentProfile: {
        create: {
          grade: "10B",
          guardian: "David Martinez",
          phone: "+1 (555) 200-0003",
          address: "789 Pine Rd, Cityville",
        },
      },
    },
  });

  const student4 = await prisma.user.create({
    data: {
      email: "david@school.com",
      password,
      name: "David Kim",
      role: "student",
      studentProfile: {
        create: {
          grade: "11A",
          guardian: "Grace Kim",
          phone: "+1 (555) 200-0004",
          address: "321 Elm St, Cityville",
        },
      },
    },
  });

  const student5 = await prisma.user.create({
    data: {
      email: "eve@school.com",
      password,
      name: "Eve Johnson",
      role: "student",
      studentProfile: {
        create: {
          grade: "11A",
          guardian: "Mark Johnson",
          phone: "+1 (555) 200-0005",
          address: "654 Cedar Ln, Cityville",
        },
      },
    },
  });

  // Create Classes
  const math10A = await prisma.class.create({
    data: {
      name: "Mathematics 10A",
      section: "Grade 10",
      teacherId: teacher1.id,
    },
  });

  const math10B = await prisma.class.create({
    data: {
      name: "Mathematics 10B",
      section: "Grade 10",
      teacherId: teacher1.id,
    },
  });

  const science11A = await prisma.class.create({
    data: {
      name: "Science 11A",
      section: "Grade 11",
      teacherId: teacher2.id,
    },
  });

  // Create Grades
  const gradesData = [
    { studentId: student1.id, classId: math10A.id, subject: "Mathematics", score: 94, grade: "A" },
    { studentId: student1.id, classId: math10A.id, subject: "English", score: 90, grade: "A-" },
    { studentId: student2.id, classId: math10A.id, subject: "Mathematics", score: 87, grade: "B+" },
    { studentId: student2.id, classId: math10A.id, subject: "English", score: 83, grade: "B" },
    { studentId: student3.id, classId: math10B.id, subject: "Mathematics", score: 92, grade: "A-" },
    { studentId: student3.id, classId: math10B.id, subject: "English", score: 96, grade: "A" },
    { studentId: student4.id, classId: science11A.id, subject: "Physics", score: 85, grade: "B+" },
    { studentId: student4.id, classId: science11A.id, subject: "Chemistry", score: 78, grade: "C+" },
    { studentId: student5.id, classId: science11A.id, subject: "Physics", score: 91, grade: "A-" },
    { studentId: student5.id, classId: science11A.id, subject: "Chemistry", score: 88, grade: "B+" },
  ];

  for (const g of gradesData) {
    await prisma.grade.create({ data: g });
  }

  // Create Attendance
  const today = new Date();
  const attendanceData = [
    { studentId: student1.id, classId: math10A.id, date: new Date(today.getTime() - 86400000), status: "present" },
    { studentId: student1.id, classId: math10A.id, date: new Date(today.getTime() - 2 * 86400000), status: "present" },
    { studentId: student2.id, classId: math10A.id, date: new Date(today.getTime() - 86400000), status: "present" },
    { studentId: student2.id, classId: math10A.id, date: new Date(today.getTime() - 2 * 86400000), status: "late" },
    { studentId: student3.id, classId: math10B.id, date: new Date(today.getTime() - 86400000), status: "present" },
    { studentId: student3.id, classId: math10B.id, date: new Date(today.getTime() - 2 * 86400000), status: "absent" },
    { studentId: student4.id, classId: science11A.id, date: new Date(today.getTime() - 86400000), status: "present" },
    { studentId: student4.id, classId: science11A.id, date: new Date(today.getTime() - 2 * 86400000), status: "present" },
    { studentId: student5.id, classId: science11A.id, date: new Date(today.getTime() - 86400000), status: "present" },
    { studentId: student5.id, classId: science11A.id, date: new Date(today.getTime() - 2 * 86400000), status: "present" },
  ];

  for (const a of attendanceData) {
    await prisma.attendance.create({ data: a });
  }

  console.log("Seed completed successfully!");
  console.log("Login credentials (password: password123):");
  console.log("  admin@school.com (admin)");
  console.log("  ahmed@school.com (teacher)");
  console.log("  sarah@school.com (teacher)");
  console.log("  alice@school.com (student)");
  console.log("  bob@school.com (student)");
  console.log("  carol@school.com (student)");
  console.log("  david@school.com (student)");
  console.log("  eve@school.com (student)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
