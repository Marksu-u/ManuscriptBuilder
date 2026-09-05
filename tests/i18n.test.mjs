import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const messages = Object.fromEntries(await Promise.all(["en", "fr"].map(async (locale) => [
  locale,
  JSON.parse(await readFile(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")),
])));

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)]));
  return typeof value;
}

test("English and French catalogs have exactly the same shape", () => {
  assert.deepEqual(shape(messages.fr), shape(messages.en));
});

test("catalogs contain the cloned legal shell and Manuscript app namespaces", () => {
  for (const locale of ["en", "fr"]) {
    const catalog = messages[locale];
    assert.ok(catalog.legalPages.cookies);
    assert.ok(catalog.legalPages.terms);
    assert.ok(catalog.legalPages.notice);
    assert.ok(catalog.legalPages.privacy);
    assert.ok(catalog.home);
    assert.ok(catalog.dashboard);
    assert.ok(catalog.workspace);
    assert.equal(JSON.stringify(catalog).includes("Dynasty Tree Builder"), false);
  }
});
