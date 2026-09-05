import { safeStorage } from "@/lib/safe-storage";

export const CONSENT_STORAGE_KEY = "boh-analytics-consent";
export const CONSENT_LIFETIME_MS = 183 * 24 * 60 * 60 * 1000;
const CONSENT_VERSION = 1;
export type ConsentChoice = "granted" | "denied";

export function parseConsent(raw: string | null, now: number): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as { v?: unknown; choice?: unknown; at?: unknown } | null;
    if (!value || value.v !== CONSENT_VERSION || (value.choice !== "granted" && value.choice !== "denied")) return null;
    if (typeof value.at !== "number" || !Number.isFinite(value.at) || now - value.at > CONSENT_LIFETIME_MS) return null;
    return value.choice;
  } catch { return null; }
}

export function readConsent(now = Date.now()): ConsentChoice | null {
  return parseConsent(safeStorage.getItem(CONSENT_STORAGE_KEY), now);
}

export function writeConsent(choice: ConsentChoice, now = Date.now()): void {
  safeStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ v: CONSENT_VERSION, choice, at: now }));
}
