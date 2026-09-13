// Matches the prototype's stat-tile pattern (design-system.md §7.2): label,
// big number, sub-label. No period-over-period delta yet — that needs a
// timeframe/comparison engine we haven't built.
export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-[#E9E4F2] rounded-2xl p-6 shadow-[0_1px_2px_rgba(11,10,13,.05)]">
      <div className="text-[13px] font-semibold text-[#7B7589]">{label}</div>
      <div className="text-[34px] font-extrabold tracking-tight text-[#141220] mt-3 leading-none">{value}</div>
      {sub && <div className="text-[13px] text-[#7B7589] mt-2.5 leading-snug">{sub}</div>}
    </div>
  );
}
