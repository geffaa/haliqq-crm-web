"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

const initials = (name?: string) =>
  (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// Avatar-triggered account menu — the recognized SaaS convention (click the
// avatar to get account actions), and it leaves room to add more items
// (settings, etc.) later without another header redesign.
export function AccountMenu({ name, email, onSignOut }: { name?: string; email?: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative ml-auto pl-5 border-l border-[#E9E4F2]" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <span className="w-9 h-9 rounded-full bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] text-white grid place-items-center text-[12px] font-extrabold shrink-0 transition-transform group-hover:scale-105">
          {initials(name)}
        </span>
        <div className="text-left">
          <div className="text-[13.5px] font-semibold text-[#141220] leading-tight">{name}</div>
          <div className="text-[12px] text-[#7B7589] leading-tight">{email}</div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white border border-[#E9E4F2] rounded-xl shadow-lg p-1.5 z-50">
          <button
            onClick={onSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13.5px] font-semibold text-[#E0517A] hover:bg-[#F7F5FB] cursor-pointer transition-colors"
          >
            <LogOut size={15} strokeWidth={2.2} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
