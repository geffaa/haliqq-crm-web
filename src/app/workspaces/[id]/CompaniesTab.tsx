"use client";

import { useState } from "react";
import { api, ApiError, type Account, type AccountInput, type Rep } from "@/lib/api";
import { inputCls, primaryBtnCls, dangerBtnCls } from "@/lib/ui";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

const empty: AccountInput = {
  name: "",
  segment: "",
  arr: 0,
  health: 70,
  lifecycle: "Prospect",
  renewalDate: null,
  ownerId: null,
};

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
  const [form, setForm] = useState<AccountInput>(empty);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const acc = await api.accounts.create(wsId, form);
    setAccounts([...accounts, acc]);
    setForm(empty);
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.accounts.remove(wsId, id);
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove company.");
    }
  };

  const repName = (id: string | null) => reps.find((r) => r.id === id)?.name ?? "—";
  const totalArr = accounts.reduce((s, a) => s + a.arr, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Companies" count={accounts.length} note={`${totalArr.toLocaleString()} ARR`} />

      <Card title="New company">
      <form onSubmit={submit} className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Company name
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Segment
          <input className={inputCls} value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} placeholder="Mid-market" />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          ARR
          <input type="number" className={inputCls} value={form.arr} onChange={(e) => setForm({ ...form, arr: +e.target.value || 0 })} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Lifecycle
          <select
            className={inputCls}
            value={form.lifecycle}
            onChange={(e) => setForm({ ...form, lifecycle: e.target.value as AccountInput["lifecycle"] })}
          >
            <option>Prospect</option>
            <option>Customer</option>
            <option>Lost</option>
            <option>Churned</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Owner
          <select
            className={inputCls}
            value={form.ownerId ?? ""}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className={primaryBtnCls} disabled={!form.name.trim()}>
          Create
        </button>
      </form>
      </Card>

      {error && <p className="text-sm text-[#E0517A]">{error}</p>}

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
              <tr key={a.id} className="border-t border-[#F0ECF7]">
                <td className="px-6 py-3.5 font-semibold">{a.name}</td>
                <td className="px-6 py-3.5 text-[#7B7589]">{a.lifecycle}</td>
                <td className="px-6 py-3.5 text-[#7B7589]">{repName(a.ownerId)}</td>
                <td className="px-6 py-3.5 text-right">{a.arr.toLocaleString()}</td>
                <td className="px-6 py-3.5 text-right">{a.health}</td>
                <td className="px-6 py-3.5 text-right">
                  <button className={dangerBtnCls} onClick={() => remove(a.id)}>
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
    </div>
  );
}
