"use client";

interface SpeechBubbleProps {
  text: string;
  maxLength?: number;
}

export function SpeechBubble({ text, maxLength = 30 }: SpeechBubbleProps) {
  const display = text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 animate-[fadeIn_0.3s_ease-out]">
      <div className="relative bg-white text-[#0b0c0e] text-[9px] font-medium px-2 py-1 rounded whitespace-nowrap max-w-[120px] truncate shadow-lg">
        {display}
        {/* Triangle pointer */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "4px solid white",
          }}
        />
      </div>
    </div>
  );
}
