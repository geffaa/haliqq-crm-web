"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api, type Account, type AccountInput, type Rep } from "@/lib/api";
import { inputCls, primaryBtnCls, ghostBtnCls, dangerBtnCls } from "@/lib/ui";
import { useEditableList } from "@/lib/useEditableList";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Drawer } from "@/components/Drawer";

const empty: AccountInput = {
  name: "",
  segment: "",
  arr: 0,
  health: 70,
  lifecycle: "Prospect",
  renewalDate: null,
  ownerId: null,
};
const toInput = (a: Account): AccountInput => ({
  name: a.name,
  segment: a.segment,
  arr: a.arr,
  health: a.health,
  lifecycle: a.lifecycle,
  renewalDate: a.renewalDate,
  ownerId: a.ownerId,
});

export function CompaniesTab({
  wsId,
  accounts,
  setAccounts,
  reps,
}: {
  wsId: string;
  accounts: Account[];
  setAccounts: (a: Account[]) => void;
  reps: Rep[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { form, setForm, editingId, edit, cancel, submit, remove, error } = useEditableList(
    wsId,
    accounts,
    setAccounts,
    api.accounts,
    empty,
    toInput,
  );

  const openCreate = () => {
    cancel();
    setDrawerOpen(true);
  };
  const openEdit = (a: Account) => {
    edit(a);
    setDrawerOpen(true);
  };
  const onSubmit = async (e: React.FormEvent) => {
    if (await submit(e)) setDrawerOpen(false);
  };

  const repName = (id: string | null) => reps.find((r) => r.id === id)?.name ?? "—";
  const totalArr = accounts.reduce((s, a) => s + a.arr, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Companies"
        count={accounts.length}
        note={`${totalArr.toLocaleString()} ARR`}
        action={
          <button onClick={openCreate} className={primaryBtnCls}>
            <span className="inline-flex items-center gap-1.5"><Plus size={15} strokeWidth={2.4} /> New company</span>
          </button>
        }
      />

      <Card title="All companies" note={`${accounts.length} ${accounts.length === 1 ? "company" : "companies"}`}>
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full text-[15px] text-[#141220]">
            <thead className="bg-[#FAF9FC] text-[11px] uppercase tracking-wide text-[#7B7589]">
              <tr>
                <th className="text-left px-6 py-3.5">Company</th>
                <th className="text-left px-6 py-3.5">Lifecycle</th>
                <th className="text-left px-6 py-3.5">Owner</th>
                <th className="text-right px-6 py-3.5">ARR</th>
                <th className="text-right px-6 py-3.5">Health</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => openEdit(a)}
                  className="border-t border-[#F0ECF7] cursor-pointer transition-colors hover:bg-[#FAF9FC]"
                >
                  <td className="px-6 py-3.5 font-semibold">{a.name}</td>
                  <td className="px-6 py-3.5 text-[#7B7589]">{a.lifecycle}</td>
                  <td className="px-6 py-3.5 text-[#7B7589]">{repName(a.ownerId)}</td>
                  <td className="px-6 py-3.5 text-right">{a.arr.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right">{a.health}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button className={dangerBtnCls} onClick={(e) => { e.stopPropagation(); remove(a.id); }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!accounts.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#7B7589]">
                    No companies yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {drawerOpen && (
        <Drawer title={editingId ? "Edit company" : "New company"} onClose={() => setDrawerOpen(false)}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Company name
              <input className={`${inputCls} w-full`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
                Segment
                <input className={`${inputCls} w-full`} value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} placeholder="Mid-market" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
                Lifecycle
                <select
                  className={`${inputCls} w-full`}
                  value={form.lifecycle}
                  onChange={(e) => setForm({ ...form, lifecycle: e.target.value as AccountInput["lifecycle"] })}
                >
                  <option>Prospect</option>
                  <option>Customer</option>
                  <option>Lost</option>
                  <option>Churned</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
                ARR
                <input type="number" className={`${inputCls} w-full`} value={form.arr} onChange={(e) => setForm({ ...form, arr: +e.target.value || 0 })} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
                Health (0–100)
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={`${inputCls} w-full`}
                  value={form.health}
                  onChange={(e) => setForm({ ...form, health: +e.target.value || 0 })}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#7B7589]">
              Owner
              <select
                className={`${inputCls} w-full`}
                value={form.ownerId ?? ""}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
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
                  {editingId ? "Save changes" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </Drawer>
      )}
    </div>
  );
}
