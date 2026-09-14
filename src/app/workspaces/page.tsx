"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, type User, type Workspace } from "@/lib/api";
import { short } from "@/lib/format";
import { inputCls, primaryBtnCls } from "@/lib/ui";
import { Mark } from "@/components/Mark";
import { LogOut } from "lucide-react";

export default function WorkspacesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [me, list] = await Promise.all([api.me(), api.listWorkspaces()]);
        setUser(me);
        setWorkspaces(list);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ws = await api.createWorkspace({ name: newName.trim(), industry: newIndustry.trim() });
    setWorkspaces((w) => [...w, ws]);
    setNewName("");
    setNewIndustry("");
  };

  const signOut = async () => {
    await api.logout();
    router.push("/sign-in");
  };

  const initials = (name?: string) =>
    (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (loading) return <div className="min-h-screen grid place-items-center text-[#7B7589] bg-[#F4F2F8]">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#F4F2F8]">
      <header className="bg-white border-b border-[#E9E4F2] px-10 py-5 flex items-center gap-4">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] text-white grid place-items-center shrink-0">
          <Mark size={16} />
        </span>
        <div>
          <div className="text-[17px] font-bold text-[#141220]">Clients</div>
          <div className="text-[13px] text-[#7B7589]">{workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}</div>
        </div>
        <div className="ml-auto flex items-center gap-3 pl-4 border-l border-[#E9E4F2]">
          <span className="w-9 h-9 rounded-full bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] text-white grid place-items-center text-[12px] font-extrabold shrink-0">
            {initials(user?.name)}
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-[#141220] leading-tight">{user?.name}</div>
            <div className="text-[12px] text-[#7B7589] leading-tight">{user?.email}</div>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="w-8 h-8 rounded-lg text-[#7B7589] grid place-items-center cursor-pointer transition-colors hover:bg-[#F7F5FB] hover:text-[#E0517A]"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="px-10 py-8 flex flex-col gap-7 max-w-[1600px]">
        <div className="bg-white border border-[#E9E4F2] rounded-2xl p-6 flex flex-wrap items-end gap-6">
          <div className="min-w-[160px]">
            <h2 className="text-[15px] font-bold text-[#141220]">New client</h2>
            <p className="text-[12.5px] text-[#7B7589] mt-1">Seeds default stages, sources, and channels.</p>
          </div>
          <form onSubmit={createWorkspace} className="flex flex-wrap gap-4 items-end flex-1">
            <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589] flex-1 min-w-[220px]">
              Company name
              <input className={inputCls} value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589] flex-1 min-w-[220px]">
              Industry
              <input className={inputCls} value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)} />
            </label>
            <button type="submit" className={primaryBtnCls} disabled={!newName.trim()}>
              Create
            </button>
          </form>
        </div>

        {workspaces.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {workspaces.map((w) => (
              <Link
                key={w.id}
                href={`/workspaces/${w.id}`}
                className="bg-white border border-[#E9E4F2] rounded-2xl p-6 flex flex-col gap-5 cursor-pointer transition-transform duration-150 hover:scale-[1.015] hover:border-[#7C40D4] active:scale-[0.99] shadow-[0_1px_2px_rgba(11,10,13,.05)]"
              >
                <header className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#7C40D4]/10 text-[#7C40D4] grid place-items-center text-[13px] font-extrabold shrink-0">
                    {w.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-[#141220] truncate">{w.name}</div>
                    <div className="text-[12.5px] text-[#7B7589] truncate">{w.industry || "—"}</div>
                  </div>
                </header>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[#7B7589]">ARR</div>
                    <div className="text-[19px] font-extrabold text-[#141220] mt-1">{short(w.arr)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[#7B7589]">Open deals</div>
                    <div className="text-[19px] font-extrabold text-[#141220] mt-1">{w.openDeals}</div>
                  </div>
                </div>
                <div className="text-[12px] text-[#7B7589] pt-4 border-t border-[#F0ECF7] capitalize">{w.role} access</div>
              </Link>
            ))}
          </div>
        )}
        {!workspaces.length && (
          <div className="bg-white border border-dashed border-[#E9E4F2] rounded-2xl p-12 text-center text-[#7B7589]">
            No client workspaces yet. Create the first one above.
          </div>
        )}
      </div>
    </div>
  );
}
