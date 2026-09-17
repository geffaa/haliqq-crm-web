"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, TrendingUp, Megaphone, Sparkles, ChevronRight, ArrowLeft, type LucideIcon } from "lucide-react";
import { Mark } from "./Mark";

export type SpaceId = "exec" | "sales" | "marketing" | "ask";
export type SubId = string;

type Sub = { id: SubId; label: string; ready: boolean };
type Space = { id: SpaceId; label: string; icon: LucideIcon; subs: Sub[] };

// Mirrors the prototype's four-Space information architecture (design-system.md
// §9: keep this IA as-is). `ready` marks what's actually wired to real data —
// everything else renders an honest "not built yet" panel, never fake numbers.
export const SPACES: Space[] = [
  { id: "exec", label: "Overview", icon: Globe, subs: [{ id: "dash", label: "Overview", ready: true }] },
  {
    id: "sales",
    label: "Sales",
    icon: TrendingUp,
    subs: [
      { id: "dash", label: "Dashboard", ready: true },
      { id: "deals", label: "Deals", ready: true },
      { id: "companies", label: "Companies", ready: true },
      { id: "people", label: "People", ready: true },
      { id: "team", label: "Team", ready: true },
      { id: "resources", label: "Resources", ready: false },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    subs: [
      { id: "dash", label: "Dashboard", ready: false },
      { id: "plan", label: "Plan", ready: false },
      { id: "campaigns", label: "Campaigns", ready: false },
      { id: "content", label: "Content", ready: false },
      { id: "ads", label: "Ads", ready: false },
      { id: "assets", label: "Creative library", ready: false },
    ],
  },
  { id: "ask", label: "Ask", icon: Sparkles, subs: [{ id: "analyst", label: "Analyst", ready: false }] },
];

export function Sidebar({
  space,
  sub,
  onNavigate,
}: {
  space: SpaceId;
  sub: SubId;
  onNavigate: (space: SpaceId, sub: SubId) => void;
}) {
  const [expanded, setExpanded] = useState<SpaceId[]>([space]);

  const toggle = (id: SpaceId) => {
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
    const target = SPACES.find((s) => s.id === id)!;
    if (space !== id) onNavigate(id, target.subs[0].id);
  };

  return (
    <aside className="w-[300px] shrink-0 bg-white border-r border-[#E9E4F2] flex flex-col h-screen sticky top-0">
      <header className="flex items-center gap-2.5 px-4 py-4 border-b border-[#F0ECF7]">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] text-white grid place-items-center shadow-[0_3px_10px_rgba(124,64,212,.3)]">
          <Mark size={16} />
        </span>
        <span className="text-[15px] font-bold text-[#141220]">Haliqq</span>
      </header>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7B7589] px-2 pb-2 opacity-80">
          Spaces
        </div>
        <div className="flex flex-col gap-1">
          {SPACES.map((s) => {
            const open = expanded.includes(s.id);
            const here = space === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id}>
                <button
                  onClick={() => toggle(s.id)}
                  className={`flex items-center gap-3 w-full rounded-xl px-2.5 py-2.5 text-[14px] font-semibold text-left cursor-pointer transition-colors ${
                    here ? "bg-[#7C40D4]/10 text-[#7C40D4]" : "text-[#141220] hover:bg-[#F8F5FC]"
                  }`}
                >
                  <ChevronRight
                    size={13}
                    strokeWidth={2.6}
                    className={`text-[#9A93A6] transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
                  />
                  <Icon size={16} strokeWidth={1.9} className={here ? "text-[#7C40D4]" : "text-[#7B7589]"} />
                  <span className="flex-1 truncate">{s.label}</span>
                </button>
                {open && (
                  <div className="flex flex-col gap-0.5 pl-[38px] pt-1 pb-2 relative before:absolute before:left-[17px] before:top-0 before:bottom-2 before:w-px before:bg-[#E9E4F2]">
                    {s.subs.map((sb) => {
                      const active = here && sub === sb.id;
                      return (
                        <button
                          key={sb.id}
                          onClick={() => onNavigate(s.id, sb.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-left cursor-pointer transition-colors ${
                            active ? "bg-[#7C40D4]/10 text-[#7C40D4]" : "text-[#7B7589] hover:bg-[#F8F5FC] hover:text-[#141220]"
                          }`}
                        >
                          <span className="flex-1 truncate">{sb.label}</span>
                          {!sb.ready && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-[#9A93A6] bg-[#F7F5FB] rounded-full px-1.5 py-0.5">
                              soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <footer className="border-t border-[#F0ECF7] p-3">
        <Link
          href="/workspaces"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13.5px] font-semibold text-[#7B7589] cursor-pointer transition-colors hover:bg-[#F8F5FC] hover:text-[#141220]"
        >
          <ArrowLeft size={15} strokeWidth={2.2} />
          Back to clients
        </Link>
      </footer>
    </aside>
  );
}
