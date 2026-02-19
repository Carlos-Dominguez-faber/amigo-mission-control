"use client";

interface DayColumnProps {
  dayIndex: number;
  isToday: boolean;
  children: React.ReactNode;
  onAddClick: () => void;
}

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DayColumn({ dayIndex, isToday, children, onAddClick }: DayColumnProps) {
  const name = DAY_NAMES[dayIndex];

  return (
    <div className="flex flex-col w-44 min-h-[200px]">
      {/* Header */}
      <div
        className={[
          "flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg",
          isToday
            ? "bg-[#7c3aed]/10 border border-[#7c3aed]/30"
            : "border border-transparent",
        ].join(" ")}
      >
        <h2
          className={[
            "text-sm font-semibold tracking-wide",
            isToday ? "text-[#7c3aed]" : "text-white",
          ].join(" ")}
        >
          {name}
        </h2>
        <button
          type="button"
          onClick={onAddClick}
          className="text-[#9aa0a6] hover:text-white text-lg leading-none transition-colors"
          aria-label={`Add event on ${name}`}
        >
          +
        </button>
      </div>

      {/* Events */}
      <div className="flex flex-col space-y-2" role="list" aria-label={`${name} events`}>
        {children}
      </div>
    </div>
  );
}
