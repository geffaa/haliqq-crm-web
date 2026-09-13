"use client";

import { useState } from "react";
import { api, ApiError, type Deal, type DealInput, type Account, type Contact, type Rep, type Stage, type Source } from "@/lib/api";
import { inputCls, primaryBtnCls, dangerBtnCls } from "@/lib/ui";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

const empty: DealInput = {
  accountId: null,
  contactId: null,
  ownerId: null,
  title: "",
  value: 0,
  stageId: "",
  closeDate: null,
  sourceId: null,
  scope: "",
  note: "",
  lostReason: null,
};

export function DealsTab({
  wsId,
  deals,
  setDeals,
  accounts,
  contacts,
  reps,
  stages,
  sources,
}: {
  wsId: string;
  deals: Deal[];
  setDeals: (d: Deal[]) => void;
  accounts: Account[];
  contacts: Contact[];
  reps: Rep[];
  stages: Stage[];
  sources: Source[];
}) {
  const [form, setForm] = useState<DealInput>({ ...empty, stageId: stages[0]?.id ?? "" });
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.stageId) return;
    const deal = await api.deals.create(wsId, form);
    setDeals([...deals, deal]);
    setForm({ ...empty, stageId: stages[0]?.id ?? "" });
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.deals.remove(wsId, id);
      setDeals(deals.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove deal.");
    }
  };

  // Changing stage here exercises the backend's stage_log tracking — every
  // move is recorded, not just the deal's current stage.
  const changeStage = async (deal: Deal, stageId: string) => {
    setError(null);
    try {
      const updated = await api.deals.update(wsId, deal.id, { ...deal, stageId });
      setDeals(deals.map((d) => (d.id === deal.id ? updated : d)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change stage.");
    }
  };

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "—";
  const stageLabel = (id: string) => stages.find((s) => s.id === id)?.label ?? "—";
  const totalValue = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Deals" count={deals.length} note={`${totalValue.toLocaleString()} total value`} />

      <Card title="New deal">
      <form onSubmit={submit} className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Deal title
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Value
          <input type="number" className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value || 0 })} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Stage
          <select className={inputCls} value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })}>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Company
          <select className={inputCls} value={form.accountId ?? ""} onChange={(e) => setForm({ ...form, accountId: e.target.value || null })}>
            <option value="">None</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Contact
          <select className={inputCls} value={form.contactId ?? ""} onChange={(e) => setForm({ ...form, contactId: e.target.value || null })}>
            <option value="">None</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Owner
          <select className={inputCls} value={form.ownerId ?? ""} onChange={(e) => setForm({ ...form, ownerId: e.target.value || null })}>
            <option value="">Unassigned</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
          Source
          <select className={inputCls} value={form.sourceId ?? ""} onChange={(e) => setForm({ ...form, sourceId: e.target.value || null })}>
            <option value="">None</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" className={primaryBtnCls} disabled={!form.title.trim() || !form.stageId}>
          Create
        </button>
      </form>
      </Card>

      {error && <p className="text-sm text-[#E0517A]">{error}</p>}

      <Card title="All deals" note={`${deals.length} ${deals.length === 1 ? "deal" : "deals"}`}>
      <div className="-mx-6 overflow-x-auto">
        <table className="w-full text-[15px] text-[#141220]">
          <thead className="bg-[#FAF9FC] text-[11px] uppercase tracking-wide text-[#7B7589]">
            <tr>
              <th className="text-left px-6 py-3.5">Deal</th>
              <th className="text-left px-6 py-3.5">Company</th>
              <th className="text-left px-6 py-3.5">Stage</th>
              <th className="text-right px-6 py-3.5">Value</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-t border-[#F0ECF7]">
                <td className="px-6 py-3.5 font-semibold">{d.title}</td>
                <td className="px-6 py-3.5 text-[#7B7589]">{accountName(d.accountId)}</td>
                <td className="px-6 py-3.5">
                  <select
                    className="rounded-md border border-[#E9E4F2] bg-[#F7F5FB] px-2 py-1 text-xs text-[#141220] outline-none focus:border-[#7C40D4] cursor-pointer"
                    value={d.stageId}
                    onChange={(e) => changeStage(d, e.target.value)}
                    title={stageLabel(d.stageId)}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-3.5 text-right">{d.value.toLocaleString()}</td>
                <td className="px-6 py-3.5 text-right">
                  <button className={dangerBtnCls} onClick={() => remove(d.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!deals.length && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[#7B7589]">
                  No deals yet.
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
