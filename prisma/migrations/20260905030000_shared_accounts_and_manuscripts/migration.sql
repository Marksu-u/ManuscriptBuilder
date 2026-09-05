-- One migration history owns both schemas. Adopt the previously untracked
-- Manuscript tables as well as supporting a fresh database.
BEGIN;
CREATE SCHEMA IF NOT EXISTS manuscript;
CREATE TABLE IF NOT EXISTS manuscript.users (
  id TEXT PRIMARY KEY, "supabaseId" TEXT NOT NULL, email TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_supabaseId_key" ON manuscript.users("supabaseId");
CREATE TABLE IF NOT EXISTS manuscript.manuscripts (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, "styleId" TEXT NOT NULL DEFAULT 'royal',
  "pageFormat" TEXT NOT NULL DEFAULT 'A4',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "ownerId" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS "manuscripts_ownerId_idx" ON manuscript.manuscripts("ownerId");
CREATE TABLE IF NOT EXISTS manuscript.pages (
  id TEXT PRIMARY KEY, position INTEGER NOT NULL, content JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "manuscriptId" TEXT NOT NULL,
  CONSTRAINT "pages_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES manuscript.manuscripts(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "pages_manuscriptId_position_key" ON manuscript.pages("manuscriptId",position);
CREATE INDEX IF NOT EXISTS "pages_manuscriptId_idx" ON manuscript.pages("manuscriptId");
CREATE TABLE IF NOT EXISTS manuscript.assets (
  id TEXT PRIMARY KEY, "storagePath" TEXT NOT NULL, "mimeType" TEXT NOT NULL,
  "fileName" TEXT, width INTEGER, height INTEGER, attribution TEXT, license TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerId" TEXT NOT NULL, "manuscriptId" TEXT,
  CONSTRAINT "assets_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES manuscript.manuscripts(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "assets_storagePath_key" ON manuscript.assets("storagePath");
CREATE INDEX IF NOT EXISTS "assets_ownerId_idx" ON manuscript.assets("ownerId");
CREATE INDEX IF NOT EXISTS "assets_manuscriptId_idx" ON manuscript.assets("manuscriptId");

-- Serialize the identity/ownership conversion with existing app writes.
LOCK TABLE public.users, manuscript.users, manuscript.manuscripts, manuscript.assets IN SHARE ROW EXCLUSIVE MODE;
INSERT INTO public.users (id,"supabaseId",email,"createdAt","updatedAt")
SELECT id,"supabaseId",email,"createdAt","updatedAt" FROM manuscript.users
ON CONFLICT ("supabaseId") DO NOTHING;
ALTER TABLE manuscript.manuscripts DROP CONSTRAINT IF EXISTS "manuscripts_ownerId_fkey";
ALTER TABLE manuscript.assets DROP CONSTRAINT IF EXISTS "assets_ownerId_fkey";
UPDATE manuscript.manuscripts m SET "ownerId"=u.id
FROM manuscript.users old, public.users u
WHERE m."ownerId"=old.id AND u."supabaseId"=old."supabaseId" AND m."ownerId"<>u.id;
UPDATE manuscript.assets a SET "ownerId"=u.id
FROM manuscript.users old, public.users u
WHERE a."ownerId"=old.id AND u."supabaseId"=old."supabaseId" AND a."ownerId"<>u.id;
ALTER TABLE manuscript.manuscripts ADD CONSTRAINT "manuscripts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE manuscript.assets ADD CONSTRAINT "assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Old deployed Manuscript clients can still read their account using the same
-- canonical ID. Retain this compatibility table until all clients are updated.
UPDATE manuscript.users old SET id=u.id FROM public.users u
WHERE old."supabaseId"=u."supabaseId" AND old.id<>u.id;
CREATE OR REPLACE FUNCTION public.mirror_legacy_manuscript_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM manuscript.users WHERE "supabaseId"=OLD."supabaseId";
    RETURN OLD;
  END IF;
  INSERT INTO manuscript.users (id,"supabaseId",email,"createdAt","updatedAt")
  VALUES (NEW.id,NEW."supabaseId",NEW.email,NEW."createdAt",NEW."updatedAt")
  ON CONFLICT ("supabaseId") DO UPDATE SET id=EXCLUDED.id,email=EXCLUDED.email,"updatedAt"=EXCLUDED."updatedAt";
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.mirror_legacy_manuscript_user() FROM PUBLIC;
CREATE TRIGGER mirror_legacy_manuscript_user AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.mirror_legacy_manuscript_user();

-- Auth owns identity. Never depend on a successful browser callback to create
-- the shared account. IDs are opaque strings, including for trigger-created rows.
CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.users (id,"supabaseId",email,"createdAt","updatedAt")
  VALUES (NEW.id::text,NEW.id::text,COALESCE(NEW.email,''),COALESCE(NEW.created_at,CURRENT_TIMESTAMP),CURRENT_TIMESTAMP)
  ON CONFLICT ("supabaseId") DO UPDATE SET email=EXCLUDED.email,"updatedAt"=EXCLUDED."updatedAt";
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_auth_user() FROM PUBLIC;
CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.users WHERE "supabaseId"=OLD.id::text;
  DELETE FROM manuscript.users WHERE "supabaseId"=OLD.id::text;
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_account_deletion() FROM PUBLIC;
DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    CREATE TRIGGER on_auth_user_synced AFTER INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user();
    DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
    CREATE TRIGGER on_auth_user_deleted AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_account_deletion();
    INSERT INTO public.users (id,"supabaseId",email,"createdAt","updatedAt")
    SELECT id::text,id::text,COALESCE(email,''),COALESCE(created_at,CURRENT_TIMESTAMP),CURRENT_TIMESTAMP FROM auth.users
    ON CONFLICT ("supabaseId") DO UPDATE SET email=EXCLUDED.email,"updatedAt"=EXCLUDED."updatedAt";
  END IF;
END;
$$;
INSERT INTO manuscript.users (id,"supabaseId",email,"createdAt","updatedAt")
SELECT id,"supabaseId",email,"createdAt","updatedAt" FROM public.users
ON CONFLICT ("supabaseId") DO UPDATE SET id=EXCLUDED.id,email=EXCLUDED.email,"updatedAt"=EXCLUDED."updatedAt";
ALTER TABLE manuscript.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscript.manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscript.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscript.assets ENABLE ROW LEVEL SECURITY;
-- These tables are accessed only by server-side Prisma, with ownership checks.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA manuscript FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA manuscript FROM authenticated;
  END IF;
END;
$$;
COMMIT;
