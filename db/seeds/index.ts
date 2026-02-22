import { seedUsers } from "./seed-user";
import { seedClassrooms } from "./seed-classroom";
import { seedSubjects } from "./seed-subject";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Seeder...");
  console.log("======================================");

  // Urutan penting: classroom harus ada sebelum user (student butuh classId)
  await seedClassrooms(prisma);
  await seedSubjects(prisma);
  await seedUsers(prisma);

  console.log("\n======================================");
  console.log("✅ All seeders completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeder failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
