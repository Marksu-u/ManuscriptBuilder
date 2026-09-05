"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { configureAnalytics, GA_MEASUREMENT_ID, GA_SCRIPT_URL, sendPageView } from "@/lib/analytics/gtag";
import { useConsent } from "./consent-provider";

function GoogleAnalyticsInner() {
  const { choice, ready } = useConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const configured = useRef(false);
  const enabled = ready && choice === "granted" && GA_MEASUREMENT_ID !== "";
  const query = searchParams.toString();
  const path = query ? `${pathname}?${query}` : pathname;
  useEffect(() => { if (enabled && !configured.current) { configureAnalytics(GA_MEASUREMENT_ID); configured.current = true; } }, [enabled]);
  useEffect(() => { if (enabled) sendPageView(GA_MEASUREMENT_ID, path); }, [enabled, path]);
  return enabled ? <Script src={GA_SCRIPT_URL} strategy="afterInteractive" /> : null;
}

export function GoogleAnalytics() {
  return <Suspense fallback={null}><GoogleAnalyticsInner /></Suspense>;
}
