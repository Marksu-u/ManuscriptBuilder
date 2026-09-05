"use client";

import { Check, Loader2, CloudOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function WorkspaceAccountChip({ saved, cloud = false, error = false }: { saved: boolean; cloud?: boolean; error?: boolean }) {
  const t = useTranslations("workspace.account");
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (cloud) return;
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
  }, [supabase, cloud]);

  if (cloud) return <div className="account-chip floating-chrome" role="status">{error ? <CloudOff /> : saved ? <Check className="account-success" /> : <Loader2 className="account-spinner" />}<span>{error ? t('notSaved') : saved ? t('cloudSaved') : t('saving')}</span><Link href="/account">{t('account')}</Link></div>;

  if (!ready) {
    return (
      <div className="account-chip floating-chrome" aria-label={t('checking')}>
        <Loader2 className="account-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-chip floating-chrome">
        <span className="guest-dot" aria-hidden="true" />
        <span>{error ? t('notSaved') : saved ? t('guestSaved') : t('savingLocal')}</span>
        <Link href="/login">{t('signIn')}</Link>
      </div>
    );
  }

  return (
    <div className="account-chip floating-chrome">
      {error ? <CloudOff /> : saved ? <Check className="account-success" /> : <Loader2 className="account-spinner" />}
      <span>{error ? t('notSaved') : saved ? t('localSaved') : t('saving')}</span>
      <Link href="/dashboard">{t('library')}</Link>
    </div>
  );
}
