import { type Deal, type Stage } from "@/lib/api";
import { short, pct } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";

// Matches the source breakdown's "Sales overview" dashboard widgets (revenue
// won, deals won, win rate, average deal size, sales cycle, pipeline
// created) — computed from deals already in the system, all-time (no
// timeframe/comparison engine yet, so every figure here is a running total,
// not "this month" — labeled as such rather than implying a period it isn't).
export function SalesOverviewTab({ deals, stages }: { deals: Deal[]; stages: Stage[] }) {
  const stageKind = (id: string) => stages.find((s) => s.id === id)?.kind;

  const won = deals.filter((d) => stageKind(d.stageId) === "won");
  const lost = deals.filter((d) => stageKind(d.stageId) === "lost");
  const open = deals.filter((d) => stageKind(d.stageId) === "open");
  const closed = won.length + lost.length;

  const revenueWon = won.reduce((s, d) => s + d.value, 0);
  const winRate = closed ? won.length / closed : null;
  const avgDealSize = won.length ? revenueWon / won.length : null;

  const cycles = won
    .filter((d) => d.closeDate)
    .map((d) => Math.max(0, Math.round((new Date(d.closeDate!).getTime() - new Date(d.createdAt).getTime()) / 86400000)));
  const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : null;

  const pipelineCreated = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Sales overview" note="All-time" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile label="Revenue won" value={short(revenueWon)} sub={`${won.length} deals won`} />
        <StatTile label="Win rate" value={pct(winRate)} sub={closed ? `${won.length} of ${closed} closed` : "Nothing closed yet"} />
        <StatTile label="Average deal size" value={avgDealSize == null ? "—" : short(avgDealSize)} sub="Won deals only" />
        <StatTile label="Sales cycle" value={avgCycle == null ? "—" : `${avgCycle}d`} sub="Created to won, average" />
        <StatTile label="Pipeline created" value={short(pipelineCreated)} sub={`${deals.length} deals, all stages`} />
        <StatTile label="Open deals" value={String(open.length)} sub={`${lost.length} lost`} />
      </div>
    </div>
  );
}
