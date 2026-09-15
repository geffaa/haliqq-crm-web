"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { api, ApiError, type User, type Workspace } from "@/lib/api";
import { short } from "@/lib/format";
import { inputCls, primaryBtnCls, ghostBtnCls } from "@/lib/ui";
import { Mark } from "@/components/Mark";
import { Drawer } from "@/components/Drawer";
import { PageHeader } from "@/components/PageHeader";
import { AccountMenu } from "@/components/AccountMenu";

export default function WorkspacesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(false);
  };

  const signOut = async () => {
    await api.logout();
    router.push("/sign-in");
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-[#7B7589] bg-[#F4F2F8]">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#F4F2F8]">
      <header className="bg-white border-b border-[#E9E4F2] px-10 py-5 flex items-center gap-4">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] text-white grid place-items-center shrink-0">
          <Mark size={16} />
        </span>
        <span className="text-[15px] font-bold text-[#141220]">Haliqq</span>

        <AccountMenu name={user?.name} email={user?.email} onSignOut={signOut} />
      </header>

      <div className="px-10 py-8 flex flex-col gap-7 max-w-[1600px]">
        <PageHeader
          title="Your clients"
          count={workspaces.length}
          action={
            <button onClick={() => setDrawerOpen(true)} className={primaryBtnCls}>
              <span className="inline-flex items-center gap-1.5"><Plus size={15} strokeWidth={2.4} /> New client</span>
            </button>
          }
        />

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
          <div className="bg-white border border-dashed border-[#E9E4F2] rounded-2xl py-16 flex flex-col items-center gap-3 text-center">
            <span className="w-12 h-12 rounded-2xl bg-[#7C40D4]/10 text-[#7C40D4] grid place-items-center">
              <Building2 size={22} strokeWidth={1.8} />
            </span>
            <div className="text-[15px] font-bold text-[#141220]">No clients yet</div>
            <p className="text-[13px] text-[#7B7589] max-w-xs">
              Every client gets its own isolated workspace. Create the first one with the button above.
            </p>
          </div>
        )}
      </div>

      {drawerOpen && (
        <Drawer title="New client" onClose={() => setDrawerOpen(false)}>
          <form onSubmit={createWorkspace} className="flex flex-col gap-4">
            <p className="text-[13px] text-[#7B7589] leading-relaxed -mt-1">
              A fresh workspace is created with default stages, sources, and channels — you can change all of them inside it.
            </p>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Company name
              <input className={`${inputCls} w-full`} value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Industry
              <input className={`${inputCls} w-full`} value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)} placeholder="e.g. Logistics" />
            </label>
            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[#F0ECF7]">
              <div className="ml-auto flex items-center gap-3">
                <button type="button" className={ghostBtnCls} onClick={() => setDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={primaryBtnCls} disabled={!newName.trim()}>
                  Create and open
                </button>
              </div>
            </div>
          </form>
        </Drawer>
      )}
    </div>
  );
}
