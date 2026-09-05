-- Ecosystem-wide account deletion.
--
-- User.supabaseId is a plain text stamp, not a foreign key to auth.users, so
-- deleting an auth user does not cascade to app data by itself. This trigger
-- makes auth-user deletion erase every ecosystem tool's rows keyed on that id.
--
-- Deleting the public.users row cascades all Dynasty Tree Builder data through
-- the onDelete: Cascade FKs already defined in the Prisma schema.
--
-- Adding a future Bag Of Holding Tools app = add one DELETE line to the function
-- body below (e.g. `DELETE FROM other_tool.users WHERE "supabaseId" = OLD.id::text;`).
-- That single central edit is the whole registration; existing tools are untouched.

-- The function can be created unconditionally: its body is not resolved against
-- auth.users at creation time, and public.users always exists.
CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $func$
BEGIN
  -- Dynasty Tree Builder: cascades dynasties/characters/relationships/custom_* rows.
  DELETE FROM public.users WHERE "supabaseId" = OLD.id::text;
  -- Future tools: add one DELETE line each, keyed on OLD.id::text.
  -- Always schema-qualify the table (search_path is intentionally empty).
  RETURN OLD;
END;
$func$;

-- Bind the trigger only when auth.users actually exists. to_regclass resolves
-- against pg_class, which (unlike information_schema) is NOT privilege-filtered,
-- so this cannot silently skip trigger creation when the migration role lacks
-- visibility into the auth schema. On Prisma's shadow database (no auth schema)
-- it returns NULL and this block is a clean no-op, so migrate validation passes.
DO $do$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
    CREATE TRIGGER on_auth_user_deleted
      AFTER DELETE ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_account_deletion();
  END IF;
END $do$;

-- Manual rollback, if this trigger ever needs to be removed in production:
--   DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
--   DROP FUNCTION IF EXISTS public.handle_account_deletion();
