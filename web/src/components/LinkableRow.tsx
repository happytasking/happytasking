"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

/**
 * A table row that navigates anywhere it is clicked, while leaving the real links
 * inside it intact. The inner anchor stays the keyboard and screen-reader entry
 * point; this only adds the mouse convenience of a large hit area.
 */
export function LinkableRow({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function isInteractive(target: EventTarget | null) {
    return !!(target as HTMLElement | null)?.closest?.(
      "a, button, input, select, textarea, label, [role='button']",
    );
  }

  function onClick(event: MouseEvent<HTMLTableRowElement>) {
    // Real controls handle their own activation.
    if (isInteractive(event.target)) return;
    // Finishing a text selection is not a navigation intent.
    if (window.getSelection()?.toString()) return;

    // Keep the browser's own "open elsewhere" shortcuts working.
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  }

  function onAuxClick(event: MouseEvent<HTMLTableRowElement>) {
    if (event.button !== 1 || isInteractive(event.target)) return;
    event.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <tr
      className={`row-link ${className}`.trim()}
      onClick={onClick}
      onAuxClick={onAuxClick}
      onMouseEnter={() => router.prefetch(href)}
    >
      {children}
    </tr>
  );
}
