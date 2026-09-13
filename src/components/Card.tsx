// Matches the prototype's <Card> primitive (design-system.md §7): white
// surface, hairline border, rounded-2xl, optional header with title + note.
export function Card({
  title,
  note,
  action,
  children,
}: {
  title?: string;
  note?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-[#E9E4F2] rounded-2xl shadow-[0_1px_2px_rgba(11,10,13,.05)] overflow-hidden">
      {(title || note || action) && (
        <header className="flex items-baseline justify-between gap-3 px-6 pt-5 pb-4 border-b border-[#F0ECF7]">
          <h2 className="text-[17px] font-bold text-[#141220] tracking-tight">{title}</h2>
          <div className="flex items-center gap-3">
            {note && <span className="text-[13px] text-[#7B7589] font-medium">{note}</span>}
            {action}
          </div>
        </header>
      )}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
