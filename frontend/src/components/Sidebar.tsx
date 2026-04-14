'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  TrendingUp,
  Building2,
  Network,
  Activity,
  ChevronRight,
  ChevronLeft,
  Menu,
} from 'lucide-react'

const MENU_ITEMS = [
  { name: 'Overview',       href: '/',             icon: LayoutDashboard, desc: 'Ringkasan Umum',          color: '#6366f1' },
  { name: 'Demografi',      href: '/demografi',    icon: Users,           desc: 'Kependudukan & Kerja',    color: '#10b981' },
  { name: 'Kesejahteraan',  href: '/kesejahteraan',icon: HeartPulse,      desc: 'IPM & Kemiskinan',        color: '#f43f5e' },
  { name: 'Ekonomi',        href: '/ekonomi',      icon: TrendingUp,      desc: 'PDRB & Pertumbuhan',      color: '#f59e0b' },
  { name: 'Infrastruktur',  href: '/infrastruktur',icon: Building2,       desc: 'Jalan & Sanitasi',        color: '#3b82f6' },
  { name: 'Klaster',        href: '/klaster',      icon: Network,         desc: 'Analisis K-Means',        color: '#8b5cf6' },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside 
      className={`h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{
        background: 'linear-gradient(180deg, rgba(5,9,22,0.98) 0%, rgba(8,12,28,0.97) 100%)',
        backdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo + Brand */}
      <div className={`p-5 border-b relative ${isCollapsed ? 'flex justify-center' : ''}`} style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
          <div className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-11 h-11'}`}
            style={{ boxShadow: '0 0 25px rgba(99,102,241,0.5), 0 0 50px rgba(99,102,241,0.15)' }}>
            <Image src="/logo.png" alt="Logo Jawa Barat" fill className="object-contain p-0.5" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in-fast">
              <h1 className="text-lg font-black tracking-tight" style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                JabarScope
              </h1>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5"
                style={{ color: 'rgba(148,163,184,0.5)' }}>
                Dashboard 2024
              </p>
            </div>
          )}
        </div>

        {/* Live indicator (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl animate-fade-in-fast"
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.18)',
            }}>
            <div className="relative flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400">Data Terkini</span>
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button 
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg z-10 hover:bg-indigo-500 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 px-3 space-y-0.5 overflow-y-auto ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!isCollapsed && (
          <p className="px-3 mb-2 text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase animate-fade-in-fast">
            Menu Navigasi
          </p>
        )}
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive ? 'sidebar-nav-active' : 'hover:bg-white/5'
              } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              {/* Active left bar */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              )}
              {isActive && isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              )}

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive
                  ? ''
                  : 'bg-white/5 group-hover:bg-white/8'
              } ${isCollapsed ? 'w-10 h-10' : ''}`} style={isActive ? { background: `${item.color}20`, border: `1px solid ${item.color}35` } : {}}>
                <Icon size={isCollapsed ? 18 : 15} className="transition-colors"
                  style={{ color: isActive ? item.color : undefined }}
                  color={isActive ? item.color : '#475569'}
                />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in-fast">
                  <span className={`text-sm font-semibold block leading-tight ${
                    isActive ? '' : 'text-slate-500 group-hover:text-slate-300'
                  }`} style={isActive ? { color: item.color } : {}}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors leading-tight">
                    {item.desc}
                  </span>
                </div>
              )}

              {isActive && !isCollapsed && (
                <ChevronRight size={12} style={{ color: item.color }} className="flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`p-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
        {!isCollapsed && (
          <div className="p-4 rounded-2xl relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.12)',
          }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-2xl pointer-events-none"
              style={{ background: '#6366f1', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-2 mb-1 relative">
              <Activity size={11} className="text-indigo-400" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                Jawa Barat
              </span>
            </div>
            <p className="text-[9px] text-slate-600 leading-relaxed relative">
              Sistem Informasi Disparitas<br />Pembangunan Regional 2024
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
