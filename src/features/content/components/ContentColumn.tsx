"use client";

interface ContentColumnProps {
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

export function ContentColumn({ label, color, count, children }: ContentColumnProps) {
  return (
    <div className="flex flex-col w-72 min-h-[200px]">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white tracking-wide">{label}</h2>
        <span
          className="ml-auto text-xs font-medium text-[#9aa0a6] bg-[#272829] rounded-full px-2 py-0.5 min-w-[22px] text-center"
          aria-label={`${count} items`}
        >
          {count}
        </span>
      </div>

      <div className="flex flex-col space-y-3" role="list" aria-label={`${label} content`}>
        {children}
      </div>
    </div>
  );
}
