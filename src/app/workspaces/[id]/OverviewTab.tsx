"use client";

import { useState } from "react";
import { api, type Account, type Deal, type Stage, type Source, type Workspace } from "@/lib/api";
import { short, pct } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";
import { inputCls, primaryBtnCls } from "@/lib/ui";
import { OverviewCharts } from "./OverviewCharts";

// This is the "Revenue cockpit" from Haliqq_OS_Product_Breakdown.xlsx —
// "are we on track for the one number". Every figure here is computed from
// real rows already loaded for this workspace, nothing is a placeholder.
//
// Not shown yet, and why (internal note, not for the dashboard):
//   Cost per won deal, CAC/LTV        needs paid ad spend (Marketing import, Milestone 3)
//   Funnel, "what changed this week"  needs a timeframe/comparison engine
//   NRR / GRR                         needs historical ARR snapshots (expansion/churn tracking)
// See docs/phase1-adapted-scope.md for the full breakdown.
export function OverviewTab({
  wsId,
  workspace,
  setWorkspace,
  accounts,
  deals,
  stages,
  sources,
}: {
  wsId: string;
  workspace: Workspace;
  setWorkspace: (w: Workspace) => void;
  accounts: Account[];
  deals: Deal[];
  stages: Stage[];
  sources: Source[];
}) {
  const stageKind = (id: string) => stages.find((s) => s.id === id)?.kind;
  const stageProb = (id: string) => stages.find((s) => s.id === id)?.prob ?? 0;

  const customers = accounts.filter((a) => a.lifecycle === "Customer");
  const totalARR = customers.reduce((s, a) => s + a.arr, 0);

  const openDeals = deals.filter((d) => stageKind(d.stageId) === "open");
  const openValue = openDeals.reduce((s, d) => s + d.value, 0);
  const weighted = openDeals.reduce((s, d) => s + d.value * stageProb(d.stageId), 0);

  const wonDeals = deals.filter((d) => stageKind(d.stageId) === "won");
  const lostDeals = deals.filter((d) => stageKind(d.stageId) === "lost");
  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount ? wonDeals.length / closedCount : null;

  const marketingSourceIds = new Set(sources.filter((s) => s.marketing).map((s) => s.id));
  const marketingWon = wonDeals.filter((d) => d.sourceId && marketingSourceIds.has(d.sourceId));
  const mktShare = wonDeals.length ? marketingWon.length / wonDeals.length : null;

  const lostValue = lostDeals.reduce((s, d) => s + d.value, 0);

  const churned = accounts.filter((a) => a.lifecycle === "Churned");
  const everCustomer = accounts.filter((a) => a.lifecycle === "Customer" || a.lifecycle === "Churned");
  const logoChurn = everCustomer.length ? churned.length / everCustomer.length : null;

  const target = workspace.annualTarget;
  const revenueVsTarget = target ? totalARR / target : null;
  const coverage = target ? openValue / target : null;

  const saveTarget = async (value: number) => {
    // PATCH only recomputes name/industry/annualTarget, not role/arr/openDeals
    // (those are list-endpoint aggregates), so merge rather than replace —
    // replacing would blank out the role this session is holding.
    const updated = await api.updateWorkspace(wsId, {
      name: workspace.name,
      industry: workspace.industry,
      annualTarget: value,
    });
    setWorkspace({ ...workspace, ...updated, role: workspace.role, arr: workspace.arr, openDeals: workspace.openDeals });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Overview" note={`${customers.length} active ${customers.length === 1 ? "customer" : "customers"}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total ARR" value={short(totalARR)} sub={`${customers.length} active accounts`} />
        <StatTile label="Open pipeline" value={short(openValue)} sub={`${openDeals.length} open deals`} />
        <StatTile label="Weighted forecast" value={short(weighted)} sub="Value × stage probability" />
        <StatTile label="Win rate" value={pct(winRate)} sub={closedCount ? `${wonDeals.length} of ${closedCount} closed` : "Nothing closed yet"} />
        <StatTile label="Deals won" value={String(wonDeals.length)} sub={`${lostDeals.length} lost`} />
        <StatTile
          label="Marketing-sourced"
          value={pct(mktShare)}
          sub={wonDeals.length ? `${marketingWon.length} of ${wonDeals.length} wins` : "No wins yet"}
        />
        <StatTile label="Lost value" value={short(lostValue)} sub={`${lostDeals.length} lost deals`} />
        <StatTile
          label="Logo churn"
          value={pct(logoChurn)}
          sub={everCustomer.length ? `${churned.length} of ${everCustomer.length} accounts` : "No customers yet"}
        />

        {target ? (
          <>
            <StatTile label="Revenue vs target" value={pct(revenueVsTarget)} sub={`${short(totalARR)} of ${short(target)}`} />
            <StatTile label="Pipeline coverage" value={coverage == null ? "—" : `${coverage.toFixed(1)}×`} sub="Open pipeline over target" />
          </>
        ) : (
          <TargetSetter onSave={saveTarget} />
        )}
      </div>

      <OverviewCharts accounts={accounts} deals={deals} stages={stages} sources={sources} />
    </div>
  );
}

// A target unlocks two tiles at once (revenue vs target, coverage), so
// asking for it lives right on the dashboard instead of a settings page
// nobody would find.
function TargetSetter({ onSave }: { onSave: (value: number) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (!n || busy) return;
    setBusy(true);
    await onSave(n);
    setBusy(false);
  };

  return (
    <form
      onSubmit={submit}
      className="col-span-2 bg-white border border-dashed border-[#E9E4F2] rounded-2xl p-6 flex flex-col justify-center gap-3"
    >
      <div className="text-[13px] font-semibold text-[#7B7589]">Set an annual revenue target</div>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="e.g. 3200000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputCls} flex-1`}
        />
        <button type="submit" className={primaryBtnCls} disabled={!value || busy}>
          Save
        </button>
      </div>
      <div className="text-[12px] text-[#7B7589]">Unlocks revenue vs target and pipeline coverage.</div>
    </form>
  );
}
