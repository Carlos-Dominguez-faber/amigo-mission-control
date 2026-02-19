"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [eyeState, setEyeState] = useState<"closed" | "open" | "blink">("open");
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setEyeState("closed");
    
    // Simulate login
    await new Promise(r => setTimeout(r, 500));
    setEyeState("open");
    await new Promise(r => setTimeout(r, 300));
    setEyeState("blink");
    await new Promise(r => setTimeout(r, 200));
    setEyeState("open");
    
    // Redirect to main app
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex flex-col items-center justify-center p-4">
      {/* Avatar */}
      <div 
        className="mb-8 cursor-pointer"
        onClick={handleLogin}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow">
          <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head/helmet */}
            <rect x="10" y="15" width="80" height="70" rx="35" fill="#ff6b00" />
            
            {/* Visor */}
            <rect x="15" y="30" width="70" height="35" rx="8" fill="#1a1a2e" />
            
            {/* Left Eye */}
            {eyeState === "open" || eyeState === "blink" ? (
              <g className={eyeState === "blink" ? "hidden" : ""}>
                <circle cx="32" cy="45" r="12" fill="#06b6d4" />
                <circle cx="32" cy="45" r="8" fill="#22d3ee" />
                <circle cx="32" cy="45" r="4" fill="#67e8f9" />
                <circle cx="29" cy="42" r="2" fill="#fff" className="opacity-80" />
              </g>
            ) : (
              <path d="M20 45 Q32 50 44 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            )}
            
            {/* Right Eye */}
            {eyeState === "open" || eyeState === "blink" ? (
              <g className={eyeState === "blink" ? "hidden" : ""}>
                <circle cx="68" cy="45" r="12" fill="#06b6d4" />
                <circle cx="68" cy="45" r="8" fill="#22d3ee" />
                <circle cx="68" cy="45" r="4" fill="#67e8f9" />
                <circle cx="65" cy="42" r="2" fill="#fff" className="opacity-80" />
              </g>
            ) : (
              <path d="M56 45 Q68 50 80 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            )}
            
            {/* Smile */}
            <path d="M35 58 Q50 68 65 58" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* Antenna */}
            <line x1="50" y1="15" x2="50" y2="5" stroke="#ff6b00" strokeWidth="3" />
            <circle cx="50" cy="4" r="3" fill="#ff6b00" className="animate-pulse" />
            
            {/* Ears */}
            <circle cx="10" cy="45" r="6" fill="#14b8a6" />
            <circle cx="90" cy="45" r="6" fill="#14b8a6" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-2">Mission Control</h1>
      <p className="text-[#9aa0a6] mb-8">Your AI-powered command center</p>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 bg-[#16181a] border border-[#272829] rounded-xl text-white placeholder-[#9aa0a6] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-[#16181a] border border-[#272829] rounded-xl text-white placeholder-[#9aa0a6] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-medium rounded-xl transition-colors"
        >
          {isLoggingIn ? "Opening..." : "Open Mission Control"}
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-[#9aa0a6] mt-8">
        Click the avatar to login
      </p>
    </div>
  );
}
