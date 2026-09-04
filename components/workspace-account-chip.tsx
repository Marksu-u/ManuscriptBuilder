"use client";

import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function WorkspaceAccountChip({ saved }: { saved: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setReady(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setReady(true);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!ready) {
    return (
      <div className="account-chip floating-chrome" aria-label="Checking account">
        <Loader2 className="account-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-chip floating-chrome">
        <span className="guest-dot" aria-hidden="true" />
        <span>Guest — saved in this browser</span>
        <Link href="/login">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="account-chip floating-chrome">
      {saved ? <Check className="account-success" /> : <Loader2 className="account-spinner" />}
      <span>{saved ? "Saved locally" : "Saving…"}</span>
      <Link href="/account">Account</Link>
    </div>
  );
}
