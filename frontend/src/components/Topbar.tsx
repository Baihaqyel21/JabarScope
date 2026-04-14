'use client'

import { Search, Bell, Calendar, Sparkles } from 'lucide-react'

export default function Topbar() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="h-14 sticky top-0 z-40 flex items-center justify-between px-8"
      style={{
        background: 'rgba(6,11,24,0.82)',
        backdropFilter: 'blur(32px) saturate(160%)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
    <header className="h-14 sticky top-0 z-40 flex items-center justify-between px-8"
      style={{
        background: 'rgba(6,11,24,0.82)',
        backdropFilter: 'blur(32px) saturate(160%)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Header elements removed as requested */}
      <div className="flex-1" />
    </header>
    </header>
  )
}
