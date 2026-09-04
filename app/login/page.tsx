"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signInWithGoogle } from "@/app/actions/auth";

const errors: Record<string, string> = {
  auth_callback_failed: "Google sign-in could not be completed. Please try again.",
  sync_failed: "You are signed in, but your Manuscript Builder profile could not be created.",
};

function LoginContent() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const code = searchParams.get("error");
    return code ? errors[code] ?? "Sign-in failed. Please try again." : null;
  });

  async function handleGoogleSignIn() {
    setPending(true);
    setError(null);
    const result = await signInWithGoogle();
    if ("error" in result) {
      setError(result.error || "Sign-in failed. Please try again.");
      setPending(false);
      return;
    }
    window.location.assign(result.url);
  }

  return (
    <main className="auth-page">
      <section className="auth-card floating-chrome">
        <span className="auth-eyebrow">BAG OF HOLDING TOOLS</span>
        <h1>Manuscript Builder</h1>
        <p>Sign in with the same Google identity you use across the suite.</p>
        <button type="button" className="google-button" onClick={handleGoogleSignIn} disabled={pending}>
          <GoogleMark />
          {pending ? "Redirecting…" : "Continue with Google"}
        </button>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <Link href="/" className="guest-link">Continue with a local guest draft</Link>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
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
