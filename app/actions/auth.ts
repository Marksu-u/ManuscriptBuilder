"use server";

import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function syncUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return;
  await ensureAppUser(user.id, user.email);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/api/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) return { error: error?.message ?? "Failed to start Google sign-in" };
  return { url: data.url };
}

export async function signOut(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(formData.get("locale") === "fr" ? "/fr/login" : "/login");
}

export async function deleteAccount(): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  // The auth deletion trigger removes the shared user and both apps' data
  // atomically. A failed Auth API request must not erase application data.
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { error: "We couldn't delete your shared account. Please try again." };
  } catch {
    return { error: "We couldn't delete your shared account. Please try again." };
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // The identity is already gone, so a stale cookie is harmless.
  }

  return { success: true };
}
