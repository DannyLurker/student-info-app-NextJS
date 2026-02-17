import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "db/schema-postgresql.prisma",
  migrations: {
    path: "db/migration",
    seed: `tsx db/seeds/index.ts`,
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
