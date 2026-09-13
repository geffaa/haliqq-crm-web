// Never fabricate numbers for an unbuilt screen — say plainly what's missing
// and where it's tracked, per phases.md.
export function NotBuiltYet({ label, milestone }: { label: string; milestone: string }) {
  return (
    <div className="bg-white border border-dashed border-[#E9E4F2] rounded-xl p-10 text-center flex flex-col items-center gap-2">
      <div className="text-sm font-bold text-[#141220]">{label} isn&apos;t built yet</div>
      <p className="text-sm text-[#7B7589] max-w-sm">
        This is scoped for {milestone}. Nothing here is faked — check{" "}
        <code className="text-[#7C40D4]">docs/phases.md</code> for the plan.
      </p>
    </div>
  );
}
