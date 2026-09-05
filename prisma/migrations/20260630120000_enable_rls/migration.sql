-- Enable Row Level Security on every table as defense-in-depth.
--
-- The app accesses all data through Prisma using the table-owner role, which
-- bypasses RLS when it is ENABLEd (not FORCEd). Supabase is used for auth only —
-- there are no direct client-side (anon/authenticated) table reads. So enabling
-- RLS here locks out any future accidental direct table access via the anon /
-- publishable key while leaving the Prisma server-action data path untouched.
--
-- When a future tool (or this one) introduces direct client reads, add
-- owner-scoped policies (e.g. owner_id chained to auth.uid()) per table at that
-- point — they can be tested against the real access path then.

ALTER TABLE "users"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dynasties"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "characters"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "relationships"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_names"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports"        ENABLE ROW LEVEL SECURITY;
