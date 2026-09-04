import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations need the direct Supabase Postgres connection. Runtime traffic
    // uses the pooled DATABASE_URL through the pg driver adapter.
    url: process.env.DIRECT_URL!,
  },
});
