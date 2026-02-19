'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0b0c0e' }}
    >
      <p className="text-gray-400 text-sm tracking-wide">Loading...</p>
    </main>
  )
}
