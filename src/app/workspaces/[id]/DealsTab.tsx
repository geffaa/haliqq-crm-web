"use client";

import { useState } from "react";
import { api, ApiError, type Deal, type DealInput, type Account, type Contact, type Rep, type Stage, type Source } from "@/lib/api";
import { inputCls, primaryBtnCls, ghostBtnCls, dangerBtnCls } from "@/lib/ui";
import { useEditableList } from "@/lib/useEditableList";
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
const toInput = (d: Deal): DealInput => ({
  accountId: d.accountId,
  contactId: d.contactId,
  ownerId: d.ownerId,
  title: d.title,
  value: d.value,
  stageId: d.stageId,
  closeDate: d.closeDate,
  sourceId: d.sourceId,
  scope: d.scope,
  note: d.note,
  lostReason: d.lostReason,
});

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
  const [view, setView] = useState<"board" | "table">("board");
  const { form, setForm, editingId, edit, cancel, submit, remove, error } = useEditableList(
    wsId,
    deals,
    setDeals,
    api.deals,
    { ...empty, stageId: stages[0]?.id ?? "" },
    toInput,
  );
  const [dragError, setDragError] = useState<string | null>(null);

  // Drag-and-drop moves are independent of whatever's loaded in the edit
  // form above — a stage change shouldn't require opening the deal first.
  const moveToStage = async (deal: Deal, stageId: string) => {
    if (deal.stageId === stageId) return;
    setDragError(null);
    try {
      const updated = await api.deals.update(wsId, deal.id, { ...toInput(deal), stageId });
      setDeals(deals.map((d) => (d.id === deal.id ? updated : d)));
    } catch (err) {
      setDragError(err instanceof ApiError ? err.message : "Could not change stage.");
    }
  };

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "—";
  const totalValue = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <PageHeader title="Deals" count={deals.length} note={`${totalValue.toLocaleString()} total value`} />
        <div className="ml-auto flex gap-1 bg-white border border-[#E9E4F2] rounded-xl p-1">
          {(["board", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize cursor-pointer transition-colors ${
                view === v ? "bg-[#7C40D4] text-white" : "text-[#7B7589] hover:text-[#141220]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <Card title={editingId ? "Edit deal" : "New deal"}>
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
            {editingId ? "Save changes" : "Create"}
          </button>
          {editingId && (
            <button type="button" className={ghostBtnCls} onClick={cancel}>
              Cancel
            </button>
          )}
        </form>
      </Card>

      {(error || dragError) && <p className="text-sm text-[#E0517A]">{error || dragError}</p>}

      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const items = deals.filter((d) => d.stageId === stage.id);
            const stageValue = items.reduce((s, d) => s + d.value, 0);
            return (
              <div
                key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("dealId");
                  const deal = deals.find((d) => d.id === id);
                  if (deal) moveToStage(deal, stage.id);
                }}
                className="w-72 shrink-0 bg-[#F7F5FB] rounded-2xl p-3"
              >
                <div className="flex items-center gap-2 px-1.5 pb-3">
                  <span className="text-[13px] font-bold text-[#141220]">{stage.label}</span>
                  <span className="text-[12px] font-semibold text-[#7B7589]">{items.length}</span>
                  <span className="ml-auto text-[12px] font-semibold text-[#7B7589]">{stageValue.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((d) => (
                    <article
                      key={d.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("dealId", d.id)}
                      onClick={() => edit(d)}
                      className={`bg-white border border-[#E9E4F2] rounded-xl p-3 cursor-pointer transition-shadow hover:shadow-md ${
                        editingId === d.id ? "ring-2 ring-[#7C40D4]" : ""
                      }`}
                    >
                      <div className="text-[13.5px] font-bold text-[#141220] leading-snug">{d.title}</div>
                      <div className="text-[12px] text-[#7B7589] mt-1">{accountName(d.accountId)}</div>
                      <div className="text-[13px] font-bold text-[#141220] mt-2">{d.value.toLocaleString()}</div>
                    </article>
                  ))}
                  {!items.length && <div className="text-[12px] text-[#9A93A6] text-center py-4">Nothing here</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
                  <tr
                    key={d.id}
                    onClick={() => edit(d)}
                    className={`border-t border-[#F0ECF7] cursor-pointer transition-colors hover:bg-[#FAF9FC] ${editingId === d.id ? "bg-[#7C40D4]/5" : ""}`}
                  >
                    <td className="px-6 py-3.5 font-semibold">{d.title}</td>
                    <td className="px-6 py-3.5 text-[#7B7589]">{accountName(d.accountId)}</td>
                    <td className="px-6 py-3.5">
                      <select
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md border border-[#E9E4F2] bg-[#F7F5FB] px-2 py-1 text-xs text-[#141220] outline-none focus:border-[#7C40D4] cursor-pointer"
                        value={d.stageId}
                        onChange={(e) => moveToStage(d, e.target.value)}
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-right">{d.value.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button className={dangerBtnCls} onClick={(e) => { e.stopPropagation(); remove(d.id); }}>
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
      )}
    </div>
  );
}
