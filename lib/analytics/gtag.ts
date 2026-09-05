declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}

export function isMeasurementId(value: string | undefined): value is string {
  return typeof value === "string" && /^G-[A-Z0-9]{10}$/.test(value);
}

const rawId = process.env.NEXT_PUBLIC_GA_ID;
export const GA_MEASUREMENT_ID = isMeasurementId(rawId) ? rawId : "";
export const GA_SCRIPT_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

function gtag(): NonNullable<Window["gtag"]> {
  window.dataLayer ??= [];
  window.gtag ??= function () {
    // eslint-disable-next-line prefer-rest-params
    (window.dataLayer ??= []).push(arguments);
  };
  return window.gtag;
}

export function configureAnalytics(id: string): void {
  const send = gtag();
  send("js", new Date());
  send("config", id, { send_page_view: false, cookie_expires: 34_128_000 });
}

export function sendPageView(id: string, path: string): void {
  gtag()("event", "page_view", { send_to: id, page_path: path, page_location: `${window.location.origin}${path}`, page_title: document.title });
}

export function disableAnalytics(id: string): void {
  if (typeof window === "undefined") return;
  if (id) (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
  if (typeof document === "undefined") return;
  const names = document.cookie.split(";").map((part) => part.split("=")[0]?.trim() ?? "").filter((name) => name === "_ga" || name === "_gid" || name.startsWith("_ga_"));
  const labels = window.location.hostname.split(".");
  const domains: (string | null)[] = [null];
  if (labels.length > 1 && !/^[\d.]+$/.test(window.location.hostname) && !window.location.hostname.includes(":")) {
    for (let index = 0; index <= labels.length - 2; index += 1) domains.push(`.${labels.slice(index).join(".")}`);
  }
  for (const name of new Set(names)) for (const domain of domains) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
  }
}
