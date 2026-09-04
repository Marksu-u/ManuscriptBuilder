import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "dist/**",
    "next-env.d.ts",
    "components/ui/carousel.tsx",
    "hooks/use-mobile.ts",
  ]),
]);
