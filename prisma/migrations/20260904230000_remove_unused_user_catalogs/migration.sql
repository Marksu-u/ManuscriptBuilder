-- These features never acquired runtime callers and all three data sets were
-- confirmed empty immediately before this migration was applied.
DROP TABLE "public"."custom_options";
DROP TABLE "public"."custom_names";

ALTER TABLE "public"."users" DROP COLUMN "username";

DROP TYPE "public"."CustomOptionKind";
DROP TYPE "public"."NameStyle";

-- Manuscript Builder owns its models and runtime client, but this shared
-- database keeps one canonical Prisma migration history.
CREATE SCHEMA IF NOT EXISTS "manuscript";

CREATE TABLE "manuscript"."users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "manuscript"."manuscripts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "styleId" TEXT NOT NULL DEFAULT 'royal',
    "pageFormat" TEXT NOT NULL DEFAULT 'A4',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "manuscripts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "manuscript"."pages" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "manuscriptId" TEXT NOT NULL,
    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "manuscript"."assets" (
    "id" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileName" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "attribution" TEXT,
    "license" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "manuscriptId" TEXT,
    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_supabaseId_key" ON "manuscript"."users"("supabaseId");
CREATE INDEX "manuscripts_ownerId_idx" ON "manuscript"."manuscripts"("ownerId");
CREATE UNIQUE INDEX "pages_manuscriptId_position_key" ON "manuscript"."pages"("manuscriptId", "position");
CREATE INDEX "pages_manuscriptId_idx" ON "manuscript"."pages"("manuscriptId");
CREATE UNIQUE INDEX "assets_storagePath_key" ON "manuscript"."assets"("storagePath");
CREATE INDEX "assets_ownerId_idx" ON "manuscript"."assets"("ownerId");
CREATE INDEX "assets_manuscriptId_idx" ON "manuscript"."assets"("manuscriptId");

ALTER TABLE "manuscript"."manuscripts"
  ADD CONSTRAINT "manuscripts_ownerId_fkey" FOREIGN KEY ("ownerId")
  REFERENCES "manuscript"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manuscript"."pages"
  ADD CONSTRAINT "pages_manuscriptId_fkey" FOREIGN KEY ("manuscriptId")
  REFERENCES "manuscript"."manuscripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manuscript"."assets"
  ADD CONSTRAINT "assets_ownerId_fkey" FOREIGN KEY ("ownerId")
  REFERENCES "manuscript"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manuscript"."assets"
  ADD CONSTRAINT "assets_manuscriptId_fkey" FOREIGN KEY ("manuscriptId")
  REFERENCES "manuscript"."manuscripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "manuscript"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "manuscript"."manuscripts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "manuscript"."pages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "manuscript"."assets" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION "public"."handle_account_deletion"()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  DELETE FROM "public"."users" WHERE "supabaseId" = OLD.id::text;
  DELETE FROM "manuscript"."users" WHERE "supabaseId" = OLD.id::text;
  RETURN OLD;
END;
$function$;

DO $do$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS "on_auth_user_deleted" ON "auth"."users";
    CREATE TRIGGER "on_auth_user_deleted"
      AFTER DELETE ON "auth"."users"
      FOR EACH ROW EXECUTE FUNCTION "public"."handle_account_deletion"();
  END IF;
END $do$;
