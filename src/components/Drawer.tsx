"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Matches design-system.md §7.5: create/edit forms live in a right-side
// slide-in drawer (460px, or 580px "wide"), never inline in the page flow
// or a center modal.
export function Drawer({
  title,
  onClose,
  wide,
  children,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-[#0B0A0D]/45 backdrop-blur-[2px] flex justify-end z-50" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`bg-white h-full flex flex-col shadow-2xl ${wide ? "w-full max-w-[580px]" : "w-full max-w-[460px]"}`}
      >
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E9E4F2] shrink-0">
          <h2 className="text-[17px] font-bold text-[#141220] truncate">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg text-[#7B7589] grid place-items-center cursor-pointer transition-colors hover:bg-[#F7F5FB]"
          >
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}
