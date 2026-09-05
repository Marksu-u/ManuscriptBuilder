export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || /[\x00-\x1f\x7f]/.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
