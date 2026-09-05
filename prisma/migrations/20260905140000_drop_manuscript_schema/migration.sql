BEGIN;
-- All application data already lives in public. Retire the rollout aliases.
DROP VIEW manuscript.assets;
DROP VIEW manuscript.pages;
DROP VIEW manuscript.manuscripts;
-- RESTRICT ensures an unexpected object cannot be deleted silently.
DROP SCHEMA manuscript RESTRICT;
COMMIT;
