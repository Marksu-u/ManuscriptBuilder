import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: "../DynastyTreeBuilder/.env" });

export default defineConfig({
  schema: "../DynastyTreeBuilder/prisma/schema.prisma",
  migrations: {
    path: "../DynastyTreeBuilder/prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
