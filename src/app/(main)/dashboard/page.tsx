'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Log out
          </button>
        </div>
        <p className="text-gray-500 text-sm">
          Main app content goes here.
        </p>
      </div>
    </div>
  )
}
