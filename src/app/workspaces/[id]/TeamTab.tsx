"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api, type Rep, type RepInput } from "@/lib/api";
import { inputCls, primaryBtnCls, ghostBtnCls, dangerBtnCls } from "@/lib/ui";
import { useEditableList } from "@/lib/useEditableList";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Drawer } from "@/components/Drawer";

const empty: RepInput = { name: "", role: "", quota: 0, since: null };
const toInput = (r: Rep): RepInput => ({ name: r.name, role: r.role, quota: r.quota, since: r.since });

export function TeamTab({ wsId, reps, setReps }: { wsId: string; reps: Rep[]; setReps: (r: Rep[]) => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { form, setForm, editingId, edit, cancel, submit, remove, error } = useEditableList(
    wsId,
    reps,
    setReps,
    api.reps,
    empty,
    toInput,
  );

  const openCreate = () => {
    cancel();
    setDrawerOpen(true);
  };
  const openEdit = (r: Rep) => {
    edit(r);
    setDrawerOpen(true);
  };
  const onSubmit = async (e: React.FormEvent) => {
    if (await submit(e)) setDrawerOpen(false);
  };

  const totalQuota = reps.reduce((s, r) => s + r.quota, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Team"
        count={reps.length}
        note={`${totalQuota.toLocaleString()} quota carried`}
        action={
          <button onClick={openCreate} className={primaryBtnCls}>
            <span className="inline-flex items-center gap-1.5"><Plus size={15} strokeWidth={2.4} /> Add team member</span>
          </button>
        }
      />

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
                <tr
                  key={r.id}
                  onClick={() => openEdit(r)}
                  className="border-t border-[#F0ECF7] cursor-pointer transition-colors hover:bg-[#FAF9FC]"
                >
                  <td className="px-6 py-3.5 font-semibold">{r.name}</td>
                  <td className="px-6 py-3.5 text-[#7B7589]">{r.role || "—"}</td>
                  <td className="px-6 py-3.5 text-right">{r.quota.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button className={dangerBtnCls} onClick={(e) => { e.stopPropagation(); remove(r.id); }}>
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

      {drawerOpen && (
        <Drawer title={editingId ? "Edit team member" : "Add team member"} onClose={() => setDrawerOpen(false)}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Name
              <input className={`${inputCls} w-full`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Role
              <input className={`${inputCls} w-full`} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Account Executive" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Annual quota
              <input
                type="number"
                className={`${inputCls} w-full`}
                value={form.quota}
                onChange={(e) => setForm({ ...form, quota: +e.target.value || 0 })}
              />
            </label>

            {error && <p className="text-sm text-[#E0517A]">{error}</p>}

            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[#F0ECF7]">
              {editingId && (
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#E0517A] cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={async () => { await remove(editingId); setDrawerOpen(false); }}
                >
                  Remove
                </button>
              )}
              <div className="ml-auto flex items-center gap-3">
                <button type="button" className={ghostBtnCls} onClick={() => setDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={primaryBtnCls} disabled={!form.name.trim()}>
                  {editingId ? "Save changes" : "Add to team"}
                </button>
              </div>
            </div>
          </form>
        </Drawer>
      )}
    </div>
  );
}
