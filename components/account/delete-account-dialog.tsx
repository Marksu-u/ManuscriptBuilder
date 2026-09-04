"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/auth";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TOOLS = ["Dynasty Tree Builder", "Manuscript Builder"];

export function DeleteAccountDialog({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const armed = confirmText.trim().toLowerCase() === email.trim().toLowerCase();

  function handleOpenChange(next: boolean) {
    if (next) {
      setConfirmText("");
      setError(null);
    }
    setOpen(next);
  }

  function handleDelete() {
    if (!armed) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.location.href = "/";
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<button className="rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:border-destructive" />}>
        Delete account
      </DialogTrigger>
      <DialogContent className="max-w-md border border-destructive/40 bg-background p-6" showCloseButton>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <DialogTitle className="text-base font-semibold text-zinc-100">Delete your account</DialogTitle>
        </div>
        <DialogDescription className="text-sm text-zinc-400">
          This permanently deletes your shared account and everything tied to it in every Bag Of Holding Tools app. This cannot be undone.
        </DialogDescription>
        <ul className="space-y-1 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
          {TOOLS.map((tool) => (
            <li key={tool} className="flex items-center gap-2 text-xs text-zinc-300">
              <Trash2 className="h-3 w-3 shrink-0 text-destructive" />
              {tool}
            </li>
          ))}
        </ul>
        <label htmlFor="delete-confirm" className="block text-xs font-medium text-zinc-400">
          Type <span className="text-zinc-200">{email}</span> to confirm
        </label>
        <input
          id="delete-confirm"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={email}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-destructive/50"
        />
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <DialogFooter className="-mx-6 -mb-6 px-6">
          <DialogClose render={<button className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200" />}>
            Cancel
          </DialogClose>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!armed || pending}
            className="rounded-md bg-destructive-fill px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D63F46] disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Delete forever"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
