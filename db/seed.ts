import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Test@12345", 12);

  // 1. Create Principal
  const principal = await prisma.user.upsert({
    where: { email: "principal@test.com" },
    update: {},
    create: {
      name: "Test Principal",
      email: "principal@test.com",
      password: passwordHash,
      role: "STAFF",
      teacherProfile: {
        create: {
          staffRole: "PRINCIPAL",
        },
      },
    },
  });
  console.log("✓ Created Principal:", principal.email);

  // 2. Create Vice Principal
  const vicePrincipal = await prisma.user.upsert({
    where: { email: "viceprincipal@test.com" },
    update: {},
    create: {
      name: "Test Vice Principal",
      email: "viceprincipal@test.com",
      password: passwordHash,
      role: "STAFF",
      teacherProfile: {
        create: {
          staffRole: "VICE_PRINCIPAL",
        },
      },
    },
  });
  console.log("✓ Created Vice Principal:", vicePrincipal.email);

  // 3. Create Teacher with Homeroom Class
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@test.com" },
    update: {},
    create: {
      name: "Test Teacher",
      email: "teacher@test.com",
      password: passwordHash,
      role: "STAFF",
      teacherProfile: {
        create: {
          staffRole: "TEACHER",
        },
      },
    },
  });
  console.log("✓ Created Teacher:", teacher.email);

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

  // 4. Create Class Secretary (Student with special role)
  const secretary = await prisma.user.upsert({
    where: { email: "secretary@test.com" },
    update: {},
    create: {
      name: "Test Class Secretary",
      email: "secretary@test.com",
      password: passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          studentRole: "CLASS_SECRETARY",
          classId: classroom.id,
        },
      },
    },
  });
  console.log("✓ Created Class Secretary:", secretary.email);

  // 5. Create Regular Student
  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@test.com",
      password: passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          classId: classroom.id,
          studentRole: "STUDENT",
        },
      },
    },
  });
  console.log("✓ Created Student:", student.email);

  // 6. Create parent Parent account
  const parent = await prisma.user.create({
    data: {
      name: `${student.name}'s parents`,
      role: "PARENT",
      password: passwordHash,
      email: `${student.name.toLowerCase().replaceAll(" ", "")}parentaccount@test.com`,
      parentProfile: {
        create: {
          studentId: student.id,
        },
      },
    },
  });
  console.log("✓ Created Parent:", parent.email);

  console.log("\n Successfully seeded database!");
  console.log("\n Test Accounts (Password: Test@12345):");
  console.log("   - Principal: principal@test.com");
  console.log("   - Vice Principal: viceprincipal@test.com");
  console.log("   - Teacher: teacher@test.com");
  console.log("   - Class Secretary: secretary@test.com");
  console.log("   - Student: student@test.com");
  console.log(
    `   - parent: ${student.name.toLowerCase().replaceAll(" ", "")}parentaccount@test.com`,
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
