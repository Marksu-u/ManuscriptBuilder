"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signInWithGoogle } from "@/app/actions/auth";

const errors: Record<string, string> = {
  auth_callback_failed: "We couldn't complete your sign-in. Please try again.",
  sync_failed: "You're signed in, but we couldn't load your account. Please try again shortly.",
};

function LoginContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    code ? errors[code] ?? "Sign-in failed. Please try again." : null,
  );

  async function handleGoogleSignIn() {
    setPending(true);
    setError(null);
    const result = await signInWithGoogle();
    if ("error" in result) {
      setError(result.error || "An error occurred");
      setPending(false);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Sign in</h1>
          <p className="text-sm text-zinc-400">Save your manuscripts and access them from any device.</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            <GoogleMark />
            {pending ? "Redirecting…" : "Continue with Google"}
          </button>

          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

          <p className="text-center text-xs text-zinc-500">
            By continuing, you agree to the{" "}
            <a href="https://dynasty.bagofholdingtools.com/terms" className="underline hover:text-zinc-300">Terms</a>
            {" "}and acknowledge the{" "}
            <a href="https://dynasty.bagofholdingtools.com/privacy" className="underline hover:text-zinc-300">Privacy Policy</a>.
          </p>
        </div>

        <p className="text-center text-xs text-zinc-500">
          No account needed to use the tool.{" "}
          <Link href="/" className="underline hover:text-zinc-300">Try it as a guest →</Link>
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.1 5.1 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06a6.38 6.38 0 0 1-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84A6.38 6.38 0 0 1 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
