BEGIN;
LOCK TABLE public.users, manuscript.users, manuscript.manuscripts, manuscript.pages, manuscript.assets IN ACCESS EXCLUSIVE MODE;
-- The previous migration consolidated identities. Refuse to remove the legacy
-- mirror if any identity has not been consolidated, rather than losing it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM manuscript.users old LEFT JOIN public.users u
    ON old."supabaseId"=u."supabaseId" AND old.id=u.id
    WHERE u.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Legacy Manuscript users are not fully consolidated';
  END IF;
END;
$$;
DROP TRIGGER mirror_legacy_manuscript_user ON public.users;
DROP FUNCTION public.mirror_legacy_manuscript_user();
CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.users WHERE "supabaseId"=OLD.id::text;
  RETURN OLD;
END;
$$;
DROP TABLE manuscript.users;

-- Move the actual tables without copying rows or changing IDs, FKs or RLS.
ALTER TABLE manuscript.manuscripts SET SCHEMA public;
ALTER TABLE manuscript.pages RENAME TO manuscript_pages;
ALTER TABLE manuscript.manuscript_pages SET SCHEMA public;
ALTER TABLE manuscript.assets RENAME TO manuscript_assets;
ALTER TABLE manuscript.manuscript_assets SET SCHEMA public;
ALTER TABLE public.manuscript_pages RENAME CONSTRAINT pages_pkey TO manuscript_pages_pkey;
ALTER TABLE public.manuscript_pages RENAME CONSTRAINT "pages_manuscriptId_fkey" TO "manuscript_pages_manuscriptId_fkey";
ALTER INDEX public."pages_manuscriptId_position_key" RENAME TO "manuscript_pages_manuscriptId_position_key";
ALTER INDEX public."pages_manuscriptId_idx" RENAME TO "manuscript_pages_manuscriptId_idx";
ALTER TABLE public.manuscript_assets RENAME CONSTRAINT assets_pkey TO manuscript_assets_pkey;
ALTER TABLE public.manuscript_assets RENAME CONSTRAINT "assets_ownerId_fkey" TO "manuscript_assets_ownerId_fkey";
ALTER TABLE public.manuscript_assets RENAME CONSTRAINT "assets_manuscriptId_fkey" TO "manuscript_assets_manuscriptId_fkey";
ALTER INDEX public."assets_storagePath_key" RENAME TO "manuscript_assets_storagePath_key";
ALTER INDEX public."assets_ownerId_idx" RENAME TO "manuscript_assets_ownerId_idx";
ALTER INDEX public."assets_manuscriptId_idx" RENAME TO "manuscript_assets_manuscriptId_idx";

-- Transitional aliases keep the currently deployed shared-user app working
-- until its regenerated Prisma client is released. All data is now in public.
-- These simple views support the app's insert/update/delete operations.
CREATE VIEW manuscript.manuscripts WITH (security_invoker = true) AS SELECT * FROM public.manuscripts;
CREATE VIEW manuscript.pages WITH (security_invoker = true) AS SELECT * FROM public.manuscript_pages;
CREATE VIEW manuscript.assets WITH (security_invoker = true) AS SELECT * FROM public.manuscript_assets;
COMMIT;
