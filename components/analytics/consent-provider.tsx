"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readConsent, writeConsent, type ConsentChoice } from "@/lib/analytics/consent";
import { disableAnalytics, GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";

type ConsentContextValue = { choice: ConsentChoice | null; ready: boolean; grant: () => void; deny: () => void };
const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used inside ConsentProvider");
  return value;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the external localStorage value after mount
    setChoice(readConsent());
    setReady(true);
  }, []);
  const grant = useCallback(() => { writeConsent("granted"); setChoice("granted"); }, []);
  const deny = useCallback(() => { writeConsent("denied"); setChoice("denied"); disableAnalytics(GA_MEASUREMENT_ID); }, []);
  const value = useMemo(() => ({ choice, ready, grant, deny }), [choice, ready, grant, deny]);
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
