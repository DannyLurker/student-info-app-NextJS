import { Grade, Major } from "@/lib/constants/class";
import { PrismaClient } from "@prisma/client";

type ClassroomSeed = {
  grade: Grade;
  major: Major;
  section: string;
};

const CLASSROOM_DATA: ClassroomSeed[] = [
  // --- TENTH ---
  { grade: "TENTH", major: "SOFTWARE_ENGINEERING", section: "1" },
  { grade: "TENTH", major: "SOFTWARE_ENGINEERING", section: "2" },
  { grade: "TENTH", major: "ACCOUNTING", section: "none" },

  // --- ELEVENTH ---
  { grade: "ELEVENTH", major: "SOFTWARE_ENGINEERING", section: "none" },
  { grade: "ELEVENTH", major: "ACCOUNTING", section: "1" },
  { grade: "ELEVENTH", major: "ACCOUNTING", section: "2" },

  // --- TWELFTH ---
  { grade: "TWELFTH", major: "SOFTWARE_ENGINEERING", section: "none" },
  { grade: "TWELFTH", major: "ACCOUNTING", section: "none" },
];

export async function seedClassrooms(prisma: PrismaClient) {
  console.log("\n📚 Seeding Classrooms...");

  let created = 0;
  let skipped = 0;

  for (const data of CLASSROOM_DATA) {
    const existing = await prisma.classroom.findUnique({
      where: {
        grade_major_section: {
          grade: data.grade,
          major: data.major,
          section: data.section,
        },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.classroom.create({ data });
    console.log(
      `   ✓  ${data.grade} – ${data.major} – Section ${data.section}`,
    );
    created++;
  }

  console.log(`   → ${created} created, ${skipped} skipped`);
}
