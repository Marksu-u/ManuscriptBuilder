import { NextResponse } from "next/server";
import { syncUser } from "@/app/actions/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (!code) return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] session exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  try {
    await syncUser();
  } catch (error) {
    console.error("[auth/callback] user sync failed:", error);
    return NextResponse.redirect(`${origin}/login?error=sync_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
