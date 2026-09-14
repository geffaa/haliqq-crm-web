export function PageHeader({
  title,
  count,
  note,
  action,
}: {
  title: string;
  count?: number;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-baseline gap-4">
        <h1 className="text-[26px] font-bold tracking-tight text-[#141220]">{title}</h1>
        {count !== undefined && (
          <span className="text-[15px] font-semibold text-[#7B7589]">
            {count} {count === 1 ? "record" : "records"}
          </span>
        )}
        {note && <span className="text-[15px] text-[#7B7589]">{note}</span>}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
