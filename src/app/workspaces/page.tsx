"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, type User, type Workspace } from "@/lib/api";

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

  if (loading) return <div className="min-h-screen grid place-items-center text-[#7B7589]">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#F4F2F8] p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#141220]">Clients</h1>
            <p className="text-sm text-[#7B7589]">Signed in as {user?.name} ({user?.email})</p>
          </div>
          <button
            onClick={signOut}
            className="text-sm font-semibold text-[#7C40D4] cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            Sign out
          </button>
        </header>

        <div className="grid gap-3">
          {workspaces.map((w) => (
            <Link
              key={w.id}
              href={`/workspaces/${w.id}`}
              className="bg-white border border-[#E9E4F2] rounded-xl p-4 cursor-pointer transition-transform duration-150 hover:scale-[1.01] hover:border-[#7C40D4] active:scale-[0.99]"
            >
              <div className="font-semibold text-[#141220]">{w.name}</div>
              <div className="text-sm text-[#7B7589]">{w.industry || "—"} · {w.role}</div>
            </Link>
          ))}
          {!workspaces.length && (
            <p className="text-sm text-[#7B7589]">No client workspaces yet. Create one below.</p>
          )}
        </div>

        <form onSubmit={createWorkspace} className="bg-white border border-[#E9E4F2] rounded-xl p-4 flex gap-3 text-[#141220]">
          <input
            placeholder="Company name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-[#E9E4F2] bg-[#F7F5FB] px-3 py-2 text-sm outline-none focus:border-[#7C40D4] placeholder:text-[#7B7589]"
          />
          <input
            placeholder="Industry"
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            className="flex-1 rounded-lg border border-[#E9E4F2] bg-[#F7F5FB] px-3 py-2 text-sm outline-none focus:border-[#7C40D4] placeholder:text-[#7B7589]"
          />
          <button
            type="submit"
            className="rounded-lg px-4 text-sm font-bold text-white bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-95"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
