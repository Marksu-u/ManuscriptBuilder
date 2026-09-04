"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function AccountControl() {
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

  if (!ready) return <div className="account-row muted">Checking session…</div>;
  if (!user) {
    return (
      <div className="account-box">
        <span>Your draft is saved in this browser.</span>
        <Link href="/login">Sign in to this tool</Link>
      </div>
    );
  }

  return (
    <div className="account-box">
      <span className="account-email">{user.email ?? "Signed in"}</span>
      <form action={signOut}><button type="submit">Sign out</button></form>
    </div>
  );
}
