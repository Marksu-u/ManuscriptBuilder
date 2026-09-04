// Publisher details shared with Dynasty Tree Builder. Keep these in one place
// for this app; the documents below describe Manuscript's own data handling.
export const PUBLISHER_ALIAS = "mKzz";
export const CONTACT_EMAIL = "support@bagofholdingtools.com";
export const LEGAL_UPDATED = { dateTime: "2026-09-05", label: "5 September 2026" } as const;
export const HOST = {
  name: "Vercel Inc.",
  address: "440 N Barranca Avenue #4133, Covina, CA 91723, United States",
  email: "privacy@vercel.com",
  privacyUrl: "https://vercel.com/legal/privacy-notice",
} as const;

export const LEGAL_LINKS = [
  { href: "/legal", label: "Legal Notice" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;
