"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { type Account, type Deal, type Stage, type Source } from "@/lib/api";
import { short } from "@/lib/format";
import { Card } from "@/components/Card";

const PURPLE = "#7C40D4";
const PINK = "#FE7CC2";
const GREY = "#9A93A6";
const BAD = "#E0517A";
const MID = "#B98CFF";

// The 4 of the prototype's 6 exec charts that are buildable with data we
// already have. Left out: ARR movement and Expansion-vs-churn, both need a
// real time-series of historical ARR snapshots, which nothing in Phase 1
// writes yet.
export function OverviewCharts({
  accounts,
  deals,
  stages,
  sources,
}: {
  accounts: Account[];
  deals: Deal[];
  stages: Stage[];
  sources: Source[];
}) {
  const openStages = stages.filter((s) => s.kind === "open");
  const byStage = openStages.map((s) => ({
    label: s.label,
    value: deals.filter((d) => d.stageId === s.id).reduce((sum, d) => sum + d.value, 0),
  }));

  const wonDeals = deals.filter((d) => stages.find((s) => s.id === d.stageId)?.kind === "won");
  const marketingSourceIds = new Set(sources.filter((s) => s.marketing).map((s) => s.id));
  const marketingWon = wonDeals.filter((d) => d.sourceId && marketingSourceIds.has(d.sourceId)).length;
  const salesWon = wonDeals.length - marketingWon;
  const attribution = [
    { name: "Marketing-sourced", value: marketingWon, fill: PURPLE },
    { name: "Sales-sourced", value: salesWon, fill: PINK },
  ];

  const customers = accounts.filter((a) => a.lifecycle === "Customer");
  const healthBands = [
    { label: "Healthy", test: (h: number) => h >= 70, fill: PURPLE },
    { label: "At risk", test: (h: number) => h >= 50 && h < 70, fill: MID },
    { label: "Churn risk", test: (h: number) => h < 50, fill: BAD },
  ].map((b) => ({ ...b, count: customers.filter((a) => b.test(a.health)).length }));

  const renewals = customers
    .filter((a) => a.renewalDate)
    .map((a) => ({ ...a, days: Math.round((new Date(a.renewalDate!).getTime() - Date.now()) / 86400000) }))
    .filter((a) => a.days >= 0 && a.days <= 90)
    .sort((a, b) => a.days - b.days);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Pipeline by stage" note="Open value">
        {byStage.some((s) => s.value > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byStage} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 12, fill: "#141220" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => short(Number(v))} cursor={{ fill: "#F7F5FB" }} />
              <Bar dataKey="value" fill={PURPLE} radius={[0, 4, 4, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="No open deals yet." />
        )}
      </Card>

      <Card title="Revenue attribution" note="Won deals">
        {wonDeals.length ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={attribution} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} stroke="none">
                  {attribution.map((a) => (
                    <Cell key={a.name} fill={a.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {attribution.map((a) => (
                <div key={a.name} className="flex items-center gap-2 text-[13px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.fill }} />
                  <span className="text-[#7B7589]">{a.name}</span>
                  <span className="font-bold text-[#141220]">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyChart text="No deals won yet." />
        )}
      </Card>

      <Card title="Health distribution" note="Active customers">
        {customers.length ? (
          <div className="flex flex-col gap-3">
            {healthBands.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-20 text-[12.5px] text-[#7B7589] shrink-0">{b.label}</span>
                <div className="flex-1 h-2 bg-[#F7F5FB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(b.count / customers.length) * 100}%`, background: b.fill }}
                  />
                </div>
                <span className="w-6 text-right text-[12.5px] font-bold text-[#141220]">{b.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyChart text="No active customers yet." />
        )}
      </Card>

      <Card title="Renewals due" note="Next 90 days">
        {renewals.length ? (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
            {renewals.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-[13px]">
                <span className="flex-1 truncate text-[#141220] font-medium">{a.name}</span>
                <span className="text-[#7B7589]">{short(a.arr)}</span>
                <span className={`text-[12px] font-bold ${a.days <= 30 ? "text-[#E0517A]" : "text-[#7B7589]"}`}>
                  {a.days === 0 ? "today" : `${a.days}d`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyChart text="Nothing renewing in the next 90 days." />
        )}
      </Card>
    </div>
  );
}

const EmptyChart = ({ text }: { text: string }) => (
  <div className="h-[120px] grid place-items-center text-[13px] text-[#7B7589]">{text}</div>
);
