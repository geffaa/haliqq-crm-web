// A plain placeholder for an unbuilt Space (Marketing, Ask). Says what's
// missing without repo paths or milestone jargon in the UI, that context
// lives in docs/phases.md and the code comments, not on screen.
export function NotBuiltYet({ label }: { label: string }) {
  return (
    <div className="bg-white border border-dashed border-[#E9E4F2] rounded-xl p-10 text-center flex flex-col items-center gap-2">
      <div className="text-sm font-bold text-[#141220]">{label} is coming soon</div>
      <p className="text-sm text-[#7B7589] max-w-sm">This part of the workspace isn&apos;t built yet.</p>
    </div>
  );
}
