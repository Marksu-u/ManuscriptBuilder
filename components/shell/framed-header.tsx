import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export function FramedHeader({
  toolName = "Manuscript Builder",
  href = "/",
  maxWidth = "max-w-5xl",
  children,
}: {
  toolName?: ReactNode;
  href?: string;
  maxWidth?: string;
  children?: ReactNode;
}) {
  return (
    <header className="h-[57px] shrink-0 border-b border-zinc-800 px-6">
      <div className={`mx-auto flex h-full ${maxWidth} items-center justify-between gap-6`}>
        <Link
          href={href}
          className="text-sm font-semibold tracking-tight text-zinc-100 transition-colors hover:text-white"
        >
          {toolName}
        </Link>
        {children ? <div className="flex items-center gap-4 sm:gap-[18px]">{children}</div> : null}
      </div>
    </header>
  );
}
