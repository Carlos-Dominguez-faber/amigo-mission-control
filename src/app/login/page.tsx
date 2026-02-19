"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eyeState, setEyeState] = useState<"closed" | "open" | "blink">("open");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        window.location.href = "/";
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    setEyeState("closed");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setEyeState("open");
      setTimeout(() => setEyeState("blink"), 300);
      setTimeout(() => setEyeState("open"), 500);
      
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
      setEyeState("open");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex flex-col items-center justify-center p-4">
      {/* Avatar */}
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-8">
        <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="15" width="80" height="70" rx="35" fill="#ff6b00" />
          <rect x="15" y="30" width="70" height="35" rx="8" fill="#1a1a2e" />
          {eyeState === "open" || eyeState === "blink" ? (
            <g className={eyeState === "blink" ? "hidden" : ""}>
              <circle cx="32" cy="45" r="12" fill="#06b6d4" />
              <circle cx="32" cy="45" r="8" fill="#22d3ee" />
              <circle cx="32" cy="45" r="4" fill="#67e8f9" />
              <circle cx="29" cy="42" r="2" fill="#fff" className="opacity-80" />
              <circle cx="68" cy="45" r="12" fill="#06b6d4" />
              <circle cx="68" cy="45" r="8" fill="#22d3ee" />
              <circle cx="68" cy="45" r="4" fill="#67e8f9" />
              <circle cx="65" cy="42" r="2" fill="#fff" className="opacity-80" />
            </g>
          ) : (
            <>
              <path d="M20 45 Q32 50 44 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
              <path d="M56 45 Q68 50 80 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            </>
          )}
          <path d="M35 58 Q50 68 65 58" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
          <line x1="50" y1="15" x2="50" y2="5" stroke="#ff6b00" strokeWidth="3" />
          <circle cx="50" cy="4" r="3" fill="#ff6b00" className="animate-pulse" />
          <circle cx="10" cy="45" r="6" fill="#14b8a6" />
          <circle cx="90" cy="45" r="6" fill="#14b8a6" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Amigo Mission Control</h1>
      <p className="text-[#9aa0a6] mb-2">Your AI-powered command center</p>
      <p className="text-xs text-[#6b7280] mb-8">Task • Content • Calendar • Memory • Team • Office</p>

      {error && (
        <div className={`w-full max-w-sm p-3 rounded-xl mb-4 ${error.startsWith("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {error}
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 bg-[#16181a] border border-[#272829] rounded-xl text-white placeholder-[#9aa0a6] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 bg-[#16181a] border border-[#272829] rounded-xl text-white placeholder-[#9aa0a6] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? "..." : "Login"}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#6b7280] mt-8">
        Powered by Supabase Auth
      </p>
    </div>
  );
}
