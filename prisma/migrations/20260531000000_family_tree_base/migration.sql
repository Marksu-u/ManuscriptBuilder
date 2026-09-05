-- ============================================================
-- Family tree base: add flags, drop role/isFounder/isLost,
-- drop relationship.tag, restrict relationship type values,
-- remove CHARACTER_ROLE and RELATIONSHIP_TAG catalog kinds
-- ============================================================

-- 1. Add flags column to characters
ALTER TABLE "characters" ADD COLUMN "flags" TEXT[] DEFAULT '{}' NOT NULL;

-- 2. Backfill flags from old role and boolean columns
UPDATE "characters" SET "flags" = array_append("flags", 'DECEASED') WHERE "role" = 'LOST';
UPDATE "characters" SET "flags" = array_append("flags", 'ADOPTED')  WHERE "role" = 'ADOPTED';
UPDATE "characters" SET "flags" = array_append("flags", 'FOUNDER')  WHERE "isFounder" = true;

-- 3. Drop old character columns
ALTER TABLE "characters" DROP COLUMN "role";
ALTER TABLE "characters" DROP COLUMN "isFounder";
ALTER TABLE "characters" DROP COLUMN "isLost";

-- 4. Drop relationship tag column
ALTER TABLE "relationships" DROP COLUMN "tag";

-- 5. Backfill relationship type to PARENT for all old non-family types
UPDATE "relationships"
SET "type" = 'PARENT'
WHERE "type" NOT IN ('PARENT', 'SPOUSE', 'ADOPTED');

-- 6. Update relationship type default to PARENT
ALTER TABLE "relationships" ALTER COLUMN "type" SET DEFAULT 'PARENT';

-- 7. Remove custom_names.role column
ALTER TABLE "custom_names" DROP COLUMN IF EXISTS "role";

-- 8. Remove custom options that used the retired catalog kinds
DELETE FROM "custom_options" WHERE "kind" IN ('CHARACTER_ROLE', 'RELATIONSHIP_TAG');

-- 9. Migrate CustomOptionKind enum (Postgres cannot drop enum values directly)
CREATE TYPE "CustomOptionKind_new" AS ENUM ('CHARACTER_STYLE', 'RELATIONSHIP_TYPE');
ALTER TABLE "custom_options"
  ALTER COLUMN "kind" TYPE "CustomOptionKind_new"
  USING "kind"::text::"CustomOptionKind_new";
DROP TYPE "CustomOptionKind";
ALTER TYPE "CustomOptionKind_new" RENAME TO "CustomOptionKind";
