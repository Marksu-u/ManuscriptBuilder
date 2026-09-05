import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function ensureAppUser(supabaseId: string, email: string): Promise<User> {
  return prisma.user.upsert({
    where: { supabaseId },
    update: { email },
    create: { supabaseId, email },
  });
}

export async function getAuthUser(): Promise<User> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const existing = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (existing && (!user.email || existing.email === user.email)) return existing;
  if (!user.email) throw new Error("Signed-in identity has no email address");
  return ensureAppUser(user.id, user.email);
}
