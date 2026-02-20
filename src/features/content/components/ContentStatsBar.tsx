"use client";

interface StatItem {
  key: string;
  label: string;
  color: string;
  count: number;
}

interface ContentStatsBarProps {
  stats: StatItem[];
}

export function ContentStatsBar({ stats }: ContentStatsBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="flex-shrink-0 bg-[#16181a] border border-[#272829] rounded-xl px-4 py-3 text-center min-w-[90px]"
        >
          <p className="text-2xl font-bold text-white">{stat.count}</p>
          <p className="text-xs text-[#9aa0a6] mt-0.5">{stat.label}</p>
          <span className={`mt-1 block w-2 h-2 rounded-full mx-auto ${stat.color}`} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
