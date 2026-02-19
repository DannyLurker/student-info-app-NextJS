import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
  console.log("\n👤 Seeding Users...")

  const passwordHash = await bcrypt.hash("Test@12345", 12);

  // 1. Principal
  const principal = await prisma.user.upsert({
    where: { email: "principal@test.com" },
    update: {},
    create: {
      name: "Test Principal",
      email: "principal@test.com",
      password: passwordHash,
      role: "STAFF",
      teacherProfile: { create: { staffRole: "PRINCIPAL" } },
    },
  });
  console.log(`   ✓  Principal: ${principal.email}`);

  // 2. Vice Principal
  const vicePrincipal = await prisma.user.upsert({
    where: { email: "viceprincipal@test.com" },
    update: {},
    create: {
      name: "Test Vice Principal",
      email: "viceprincipal@test.com",
      password: passwordHash,
      role: "STAFF",
      teacherProfile: { create: { staffRole: "VICE_PRINCIPAL" } },
    },
  });
  console.log(`   ✓  Vice Principal: ${vicePrincipal.email}`);

  // 3. Teacher + Homeroom Class
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@test.com" },
    update: {},
    create: {
      name: "Test Teacher",
      email: "teacher@test.com",
      password: passwordHash,
      role: "STAFF",
      teacherProfile: { create: { staffRole: "TEACHER" } },
    },
  });
  console.log(`   ✓  Teacher: ${teacher.email}`);

  const classroom = await prisma.classroom.upsert({
    where: {
      grade_major_section: {
        grade: "ELEVENTH",
        major: "SOFTWARE_ENGINEERING",
        section: "none",
      },
    },
    update: {},
    create: {
      grade: "ELEVENTH",
      major: "SOFTWARE_ENGINEERING",
      section: "none",
      homeroomTeacherId: teacher.id,
    },
  });

  // 4. Class Secretary
  const secretary = await prisma.user.upsert({
    where: { email: "secretary@test.com" },
    update: {},
    create: {
      name: "Test Class Secretary",
      email: "secretary@test.com",
      password: passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: { studentRole: "CLASS_SECRETARY", classId: classroom.id },
      },
    },
  });
  console.log(`   ✓  Class Secretary: ${secretary.email}`);

  // 5. Student
  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@test.com",
      password: passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: { classId: classroom.id, studentRole: "STUDENT" },
      },
    },
  });
  console.log(`   ✓  Student: ${student.email}`);

  // 6. Parent
  const parentEmail = `${student.name.toLowerCase().replaceAll(" ", "")}parentaccount@test.com`;
  const parent = await prisma.user.upsert({
    where: { email: parentEmail },
    update: {},
    create: {
      name: `${student.name}'s Parents`,
      role: "PARENT",
      password: passwordHash,
      email: parentEmail,
      parentProfile: { create: { studentId: student.id } },
    },
  });
  console.log(`   ✓  Parent: ${parent.email}`);

  console.log(`   → 6 users seeded`);
}
