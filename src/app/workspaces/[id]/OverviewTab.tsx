import { type Account, type Deal, type Stage, type Source } from "@/lib/api";
import { short, pct } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { StatTile } from "@/components/StatTile";

// Every figure here is computed from real rows already loaded for this
// workspace — nothing here is a placeholder number. Metrics that need data
// we don't collect yet (ad spend for CAC, historical ARR snapshots for NRR)
// are named explicitly below instead of being faked.
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

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Overview" note={`${customers.length} active ${customers.length === 1 ? "customer" : "customers"}`} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
      </div>

      <Card title="Not available yet" note="Needs data we don't collect yet">
        <ul className="text-sm text-[#7B7589] leading-relaxed list-disc pl-4 flex flex-col gap-1">
          <li><b className="text-[#141220]">CAC / LTV:CAC</b> — needs paid ad spend (Marketing import, Milestone 3)</li>
          <li><b className="text-[#141220]">NRR / GRR</b> — needs historical ARR snapshots (expansion/churn tracking)</li>
          <li><b className="text-[#141220]">Pipeline coverage</b> — needs an annual revenue target to compare against</li>
        </ul>
      </Card>
    </div>
  );
}
