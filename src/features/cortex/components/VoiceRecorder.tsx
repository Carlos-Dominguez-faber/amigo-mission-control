"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square } from "lucide-react";

interface VoiceRecorderProps {
  onRecorded: (blob: Blob) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecorded, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        onRecorded(blob);
        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        setSeconds(0);
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        type="button"
        disabled={disabled}
        onClick={isRecording ? stopRecording : startRecording}
        className={[
          "w-16 h-16 rounded-full flex items-center justify-center transition-all",
          isRecording
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-[#7c3aed] hover:bg-[#6d28d9]",
          disabled ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <Square className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      <span className="text-sm text-[#9aa0a6] font-mono">
        {isRecording ? `${mm}:${ss}` : "Tap to record"}
      </span>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
