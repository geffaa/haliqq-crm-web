"use client";

import { useState } from "react";
import { api, ApiError, type Rep, type RepInput } from "@/lib/api";
import { inputCls, primaryBtnCls, dangerBtnCls } from "@/lib/ui";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

const empty: RepInput = { name: "", role: "", quota: 0, since: null };

export function TeamTab({ wsId, reps, setReps }: { wsId: string; reps: Rep[]; setReps: (r: Rep[]) => void }) {
  const [form, setForm] = useState<RepInput>(empty);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const rep = await api.reps.create(wsId, form);
    setReps([...reps, rep]);
    setForm(empty);
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.reps.remove(wsId, id);
      setReps(reps.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove team member.");
    }
  };

  const totalQuota = reps.reduce((s, r) => s + r.quota, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Team" count={reps.length} note={`${totalQuota.toLocaleString()} quota carried`} />

      <Card title="Add team member">
      <form onSubmit={submit} className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Name
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Role
          <input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Account Executive" />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Annual quota
          <input
            type="number"
            className={inputCls}
            value={form.quota}
            onChange={(e) => setForm({ ...form, quota: +e.target.value || 0 })}
          />
        </label>
        <button type="submit" className={primaryBtnCls} disabled={!form.name.trim()}>
          Add to team
        </button>
      </form>
      </Card>

      {error && <p className="text-sm text-[#E0517A]">{error}</p>}

      <Card title="Team members" note={`${reps.length} ${reps.length === 1 ? "person" : "people"}`}>
      <div className="-mx-6 overflow-x-auto">
        <table className="w-full text-[15px] text-[#141220]">
          <thead className="bg-[#FAF9FC] text-[11px] uppercase tracking-wide text-[#7B7589]">
            <tr>
              <th className="text-left px-6 py-3.5">Name</th>
              <th className="text-left px-6 py-3.5">Role</th>
              <th className="text-right px-6 py-3.5">Quota</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {reps.map((r) => (
              <tr key={r.id} className="border-t border-[#F0ECF7]">
                <td className="px-6 py-3.5 font-semibold">{r.name}</td>
                <td className="px-6 py-3.5 text-[#7B7589]">{r.role || "—"}</td>
                <td className="px-6 py-3.5 text-right">{r.quota.toLocaleString()}</td>
                <td className="px-6 py-3.5 text-right">
                  <button className={dangerBtnCls} onClick={() => remove(r.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!reps.length && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[#7B7589]">
                  No team members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </Card>
    </div>
  );
}
