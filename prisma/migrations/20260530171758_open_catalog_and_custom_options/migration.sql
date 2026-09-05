-- Safe migration: convert closed enum columns to open TEXT columns.
-- Uses ALTER COLUMN ... TYPE TEXT USING ...::text to preserve all existing data.
-- No DROP COLUMN is used.

-- CreateEnum (new — developer-controlled kind set for user-authored catalog options)
CREATE TYPE "CustomOptionKind" AS ENUM ('CHARACTER_ROLE', 'CHARACTER_STYLE', 'RELATIONSHIP_TYPE', 'RELATIONSHIP_TAG');

-- ─── characters: role + style ──────────────────────────────────────────────────
ALTER TABLE "characters"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE TEXT USING "role"::text,
  ALTER COLUMN "role" SET DEFAULT 'UNKNOWN';

ALTER TABLE "characters"
  ALTER COLUMN "style" DROP DEFAULT,
  ALTER COLUMN "style" TYPE TEXT USING "style"::text,
  ALTER COLUMN "style" SET DEFAULT 'OTHER';

-- ─── relationships: type + tag ────────────────────────────────────────────────
ALTER TABLE "relationships"
  ALTER COLUMN "type" DROP DEFAULT,
  ALTER COLUMN "type" TYPE TEXT USING "type"::text,
  ALTER COLUMN "type" SET DEFAULT 'UNKNOWN';

ALTER TABLE "relationships"
  ALTER COLUMN "tag" TYPE TEXT USING "tag"::text;

-- ─── custom_names: role ───────────────────────────────────────────────────────
ALTER TABLE "custom_names"
  ALTER COLUMN "role" TYPE TEXT USING "role"::text;

-- ─── Drop now-unused enum types (must come after all column conversions) ───────
DROP TYPE IF EXISTS "CharacterRole";
DROP TYPE IF EXISTS "CharacterStyle";
DROP TYPE IF EXISTS "RelationshipType";
DROP TYPE IF EXISTS "RelationshipTag";

-- ─── CreateTable custom_options ───────────────────────────────────────────────
CREATE TABLE "custom_options" (
    "id" TEXT NOT NULL,
    "kind" "CustomOptionKind" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "custom_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_options_userId_idx" ON "custom_options"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_options_userId_kind_value_key" ON "custom_options"("userId", "kind", "value");

-- AddForeignKey
ALTER TABLE "custom_options" ADD CONSTRAINT "custom_options_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
