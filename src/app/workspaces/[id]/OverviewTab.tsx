import { type Account, type Deal, type Stage, type Source } from "@/lib/api";
import { short, pct } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";

// This is the "Revenue cockpit" from Haliqq_OS_Product_Breakdown.xlsx —
// "are we on track for the one number". Every figure here is computed from
// real rows already loaded for this workspace, nothing is a placeholder.
//
// Not shown yet, and why (internal note, not for the dashboard):
//   Revenue vs target, coverage  needs an annual revenue target (no such field yet)
//   Cost per won deal, CAC/LTV  needs paid ad spend (Marketing import, Milestone 3)
//   Funnel, "what changed this week"  needs a timeframe/comparison engine
//   NRR / GRR                   needs historical ARR snapshots (expansion/churn tracking)
// See docs/phase1-adapted-scope.md for the full breakdown.
export function OverviewTab({ accounts, deals, stages, sources }: { accounts: Account[]; deals: Deal[]; stages: Stage[]; sources: Source[] }) {
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
      </div>
    </div>
  );
}
