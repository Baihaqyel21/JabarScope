'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import {
  ArrowUpRight, ArrowDownRight, Database,
  AlertCircle, Users, TrendingUp, MapPin, Activity,
  ChevronRight, Layers, Star, Globe2, BarChart3
} from 'lucide-react'

const ChoroplethMap = dynamic(() => import('@/components/ChoroplethMap'), { ssr: false })

const API = 'http://127.0.0.1:8000'

const CLUSTER_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e']

const tooltipStyle = {
  borderRadius: '14px',
  border: '1px solid rgba(99,102,241,0.2)',
  background: 'rgba(8,12,30,0.97)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.7)',
  fontSize: '13px',
  color: '#e2e8f0',
  padding: '10px 14px',
}

/* ── KPI Card ────────────────────────────────────────────────── */
function KPI({ title, value, change, isPositive, icon, color }: any) {
  const colors: Record<string, { bg: string; glow: string; text: string; border: string }> = {
    indigo:  { bg: 'rgba(99,102,241,0.12)',  glow: 'rgba(99,102,241,0.3)',  text: '#818cf8', border: 'rgba(99,102,241,0.25)' },
    emerald: { bg: 'rgba(52,211,153,0.12)',  glow: 'rgba(52,211,153,0.3)',  text: '#34d399', border: 'rgba(52,211,153,0.25)' },
    rose:    { bg: 'rgba(244,63,94,0.12)',   glow: 'rgba(244,63,94,0.3)',   text: '#fb7185', border: 'rgba(244,63,94,0.25)' },
    amber:   { bg: 'rgba(251,191,36,0.12)',  glow: 'rgba(251,191,36,0.25)', text: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  }
  const c = colors[color] ?? colors.indigo
  return (
    <div className="kpi-card rounded-2xl p-5 relative overflow-hidden">
      {/* Decorative corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: c.glow, transform: 'translate(30%, -30%)' }} />
      <div className="flex items-start justify-between mb-4 relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
          style={{ background: c.bg, boxShadow: `0 0 20px ${c.glow}`, border: `1px solid ${c.border}` }}>
          <span style={{ color: c.text }}>{icon}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`} style={{ border: isPositive ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(244,63,94,0.2)' }}>
          {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {change}
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500 mb-1.5 relative">{title}</p>
      <h3 className="text-2xl font-bold text-white relative tracking-tight">{value}</h3>
    </div>
  )
}

/* ── Landing Hero ────────────────────────────────────────────── */
function LandingHero({ onEnter, isLeaving }: { onEnter: () => void, isLeaving: boolean }) {
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMouse = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
        background: '#000',
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseMove={handleMouse}
    >
      {/* Cinematic background image */}
      <div style={{ position: 'absolute', inset: 0 }} className="hero-image">
        <Image
          src="/bandung_hero.jpg"
          alt="Potret Kota Bandung"
          fill
          className="object-cover"
          style={{ 
            opacity: loaded ? 0.7 : 0, 
            transition: 'opacity 1.5s ease',
            objectPosition: 'center'
          }}
          priority
        />
      </div>

      {/* Multi-layer overlays for cinematic depth */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(4,8,20,0.5) 50%, rgba(6,11,24,0.92) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 80% 60% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(99,102,241,0.10) 0%, transparent 70%)`
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)'
      }} />
      {/* Subtle scan line */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)',
      }} />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute rounded-full opacity-40"
          style={{
            width: `${3 + i * 2}px`,
            height: `${3 + i * 2}px`,
            left: `${10 + i * 15}%`,
            background: `hsl(${230 + i * 20}, 80%, 70%)`,
            animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Content */}
      <div className="absolute top-10 right-10 z-[10000]" style={{ 
        opacity: loaded && !isLeaving ? 1 : 0, 
        transition: 'opacity 0.8s ease 0.6s' 
      }}>
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
          style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}>
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Provinsi Jawa Barat
          </span>
        </div>
      </div>

      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease 0.5s' }}>

        {/* Badge top */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.35)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(99,102,241,0.15)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-indigo-300">
              Platform Analitik Regional
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Logo + Title group */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <div className="w-16 h-16 relative rounded-2xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: '0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2)' }}>
            <Image src="/logo.png" alt="Logo Jawa Barat" fill className="object-contain p-1.5" />
          </div>
          <div className="text-left">
            <h1 className="text-7xl font-black text-white leading-none tracking-tighter hero-title-glow"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Jabar<span style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c4b5fd 80%, #e0d9ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Scope</span>
            </h1>
            <p className="text-base text-slate-400 font-medium tracking-wide mt-1">
              Dashboard Disparitas Pembangunan
            </p>
          </div>
        </div>

        <p className="text-lg text-slate-300 mb-3 font-light max-w-2xl mx-auto leading-relaxed">
          Potret menyeluruh{' '}
          <span className="text-indigo-300 font-semibold">27 kabupaten/kota</span>{' '}
          Jawa Barat dalam satu platform analitik berbasis data statistik resmi 2024.
        </p>

        {/* Location tag */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <MapPin size={13} className="text-indigo-400" />
          <span className="text-xs text-slate-500 font-medium">Provinsi Jawa Barat, Indonesia</span>
          <span className="text-slate-700">·</span>
          <Globe2 size={12} className="text-slate-600" />
          <span className="text-xs text-slate-500">Data BPS 2024</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { label: 'Kab/Kota', value: '27', icon: <MapPin size={14} /> },
            { label: 'Indikator', value: '20+', icon: <BarChart3 size={14} /> },
            { label: 'Tahun Data', value: '5', icon: <Database size={14} /> },
          ].map((s, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <div className="hero-divider mx-3" />}
              <div className="hero-stat-card rounded-2xl px-5 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-indigo-400">{s.icon}</span>
                  <span className="text-3xl font-black text-gradient-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.value}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold text-white overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #5558e3 0%, #7c3aed 100%)',
              boxShadow: '0 0 40px rgba(99,102,241,0.6), 0 8px 40px rgba(0,0,0,0.4)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 0 60px rgba(99,102,241,0.8), 0 15px 50px rgba(0,0,0,0.5)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.6), 0 8px 40px rgba(0,0,0,0.4)'
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 animate-shimmer" />
            <span className="relative">Jelajahi Dashboard</span>
            <ChevronRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-xs text-slate-600">
            Sumber data resmi · Badan Pusat Statistik Provinsi Jawa Barat
          </p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(6,11,24,1) 0%, transparent 100%)' }} />
    </div>
  )
}

/* ── Main Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
  const [showHero, setShowHero] = useState(true)
  const [heroLeaving, setHeroLeaving] = useState(false)
  const [data, setData] = useState<any>(null)
  const [geojson, setGeojson] = useState<any>(null)
  const [clustering, setClustering] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/overview`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch(`${API}/api/geojson`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/api/clustering`).then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([overview, geo, clust]) => {
        setData(overview); setGeojson(geo); setClustering(clust); setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const handleEnter = () => {
    setHeroLeaving(true)
    setTimeout(() => setShowHero(false), 600)
  }

  if (showHero) return <LandingHero onEnter={handleEnter} isLeaving={heroLeaving} />

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-violet-500/30 border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-slate-500 text-sm font-medium">Memuat data…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 min-h-[60vh]">
      <AlertCircle size={40} className="text-rose-400" />
      <p className="font-semibold text-slate-300">Backend tidak dapat dijangkau</p>
      <p className="text-sm">Pastikan FastAPI berjalan di <code className="px-2 py-0.5 rounded bg-white/5">http://127.0.0.1:8000</code></p>
    </div>
  )

  const kpi = data?.kpi ?? {}
  const ranking: any[] = (data?.ranking ?? []).slice(0, 10)
  const topData = [...(data?.data ?? [])]
    .sort((a, b) => (b['Skor Komposit'] ?? 0) - (a['Skor Komposit'] ?? 0))
    .slice(0, 10)
    .map((d: any) => ({ name: d['Nama Pendek'], skor: Number((d['Skor Komposit'] ?? 0).toFixed(1)) }))
  const clusterSummary = clustering?.summary ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between mb-2">
        <div className="page-header-accent pl-4 py-2 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          </div>
          <p className="text-slate-500 text-sm">Disparitas Pembangunan Jawa Barat · Data BPS 2024</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Live · 27 Daerah</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI title="Total Penduduk" value={`${(kpi.total_pop / 1000).toFixed(2)} Jt`}
          change="+1.2%" isPositive icon={<Users size={16} />} color="indigo" />
        <KPI title="Rata-rata IPM" value={(kpi.avg_ipm ?? 0).toFixed(2)}
          change="+0.8%" isPositive icon={<Activity size={16} />} color="emerald" />
        <KPI title="Tingkat Kemiskinan" value={`${(kpi.avg_miskin ?? 0).toFixed(2)}%`}
          change="-0.5%" isPositive icon={<TrendingUp size={16} />} color="amber" />
        <KPI title="Pengangguran (TPT)" value={`${(kpi.avg_tpt ?? 0).toFixed(2)}%`}
          change="-1.1%" isPositive icon={<Database size={16} />} color="rose" />
      </div>

      {/* Map + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <MapPin size={14} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Peta Skor Komposit Pembangunan</h2>
                <p className="text-xs text-slate-600">27 Kab/Kota Jawa Barat · 2024</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
              BPS 2024
            </span>
          </div>
          {geojson ? (
            <ChoroplethMap
              geojson={geojson}
              kabkota={(data?.data ?? []).map((d: any) => ({ ...d, skor_komposit: d['Skor Komposit'] }))}
              metric="composite"
            />
          ) : (
            <div className="h-[340px] flex items-center justify-center text-slate-600 text-sm rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              GeoJSON tidak tersedia
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Top 5 */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                <h2 className="text-sm font-bold text-white">Top 5 Skor Komposit</h2>
              </div>
            </div>
            <div className="space-y-1">
              {ranking.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="data-row flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: i === 0 ? 'rgba(251,191,36,0.2)' : i === 1 ? 'rgba(148,163,184,0.12)' : i === 2 ? 'rgba(180,120,60,0.15)' : 'rgba(255,255,255,0.05)',
                        color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b87a3c' : '#475569'
                      }}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">{d['Nama Pendek']}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${d['Tipe'] === 'Kota' ? 'badge-kota' : 'badge-kab'}`}>
                      {d['Tipe']}
                    </span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{Number(d['Skor Komposit']).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* K-Means */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Analisis K-Means</h2>
              </div>
              {clustering?.silhouette != null && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400">
                    Sil: {clustering.silhouette.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              {clusterSummary.length > 0 ? clusterSummary.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseOver={e => { e.currentTarget.style.background = `${CLUSTER_COLORS[i]}10` }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: CLUSTER_COLORS[i] + '20' }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CLUSTER_COLORS[i], boxShadow: `0 0 8px ${CLUSTER_COLORS[i]}` }} />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">{c.Klaster}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{c.anggota?.length ?? 0} daerah</span>
                </div>
              )) : (
                <p className="text-xs text-slate-600 text-center py-2">Data klaster tidak tersedia</p>
              )}
            </div>
            <a href="/klaster" className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-indigo-400 transition-all"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)' }}>
              Lihat Detail Klaster
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Bar Chart: Top 10 Skor Komposit */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <BarChart3 size={14} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Top 10 — Skor Komposit Pembangunan</h2>
            <p className="text-xs text-slate-600">Ranking kabupaten/kota terbaik 2024</p>
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: '#475569', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: any) => [Number(v).toFixed(1), 'Skor Komposit']}
                itemStyle={{ color: '#a5b4fc' }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="skor" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
