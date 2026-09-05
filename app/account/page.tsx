import { pageMetadata } from "@/lib/site";
import { Trash2 } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { FramedHeader } from "@/components/shell/framed-header";
import { LegalFooter } from "@/components/legal/legal-footer";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = pageMetadata({
  title: "Account · Manuscript Builder",
  description: "Manage your Manuscript Builder account and shared sign-in.",
  path: "/account", noindex: true,
});

export default async function AccountPage() {
  const user = await getAuthUser();
  const manuscriptCount = await prisma.manuscript.count({ where: { ownerId: user.id } });

  return (
    <div className="flex min-h-screen flex-col bg-background text-zinc-100">
      <FramedHeader toolName="← Your manuscripts" href="/dashboard" maxWidth="max-w-xl">
        <form action={signOut}>
          <button type="submit" className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-zinc-300">
            Sign out
          </button>
        </form>
      </FramedHeader>

      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-medium tracking-tight">Account</h1>

        <section className="mt-6 divide-y divide-zinc-800 rounded-xl border border-zinc-700 bg-surface-1 px-4">
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <span className="text-zinc-400">Email</span>
            <span className="truncate text-zinc-100">{user.email}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <span className="text-zinc-400">Saved manuscripts</span>
            <span className="font-mono tabular-nums text-zinc-100">{manuscriptCount}</span>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-zinc-800 border-l-2 border-l-destructive bg-surface-2 p-5">
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Deleting your account permanently erases your shared sign-in and everything tied to it. This cannot be undone.
          </p>
          <p className="mt-3 text-sm text-zinc-400">One account covers every Bag Of Holding Tools app:</p>
          <ul className="mt-2 space-y-1">
            {["Dynasty Tree Builder", "Manuscript Builder"].map((tool) => (
              <li key={tool} className="flex items-center gap-2 text-sm text-zinc-300">
                <Trash2 className="h-3.5 w-3.5 shrink-0 text-destructive" />
                {tool}
              </li>
            ))}
          </ul>
          <div className="mt-4"><DeleteAccountDialog email={user.email} /></div>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
