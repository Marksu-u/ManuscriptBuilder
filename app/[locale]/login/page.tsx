"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signInWithGoogle } from "@/app/actions/auth";

/** The `error` values the auth callback can put in the URL. */
const KNOWN_ERRORS = ["auth_callback_failed", "sync_failed"] as const;

function LoginContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const t = useTranslations("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError
      ? t(
          (KNOWN_ERRORS as readonly string[]).includes(urlError)
            ? `errors.${urlError}`
            : "errors.generic",
        )
      : null,
  );

  async function handleGoogleSignIn() {
    setPending(true);
    setError(null);

    const result = await signInWithGoogle();

    if ("error" in result) {
      setError(result.error || t("errors.unknown"));
      setPending(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {t("heading")}
          </h1>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {pending ? t("redirecting") : t("google")}
          </button>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <p className="text-center text-xs text-zinc-500">
            {t.rich("legal", {
              terms: (chunks) => (
                <Link href="/terms" className="underline hover:text-zinc-300">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy" className="underline hover:text-zinc-300">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>

        <p className="text-center text-xs text-zinc-500">
          {t("guest")}{" "}
          <Link href="/workspace" className="underline hover:text-zinc-300">
            {t("guestLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

