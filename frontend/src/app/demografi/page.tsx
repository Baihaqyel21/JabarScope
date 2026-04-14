'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { Users, Briefcase, TrendingUp, Banknote, AlertCircle, Map, Activity, ChevronDown, ArrowRight } from 'lucide-react'

const ChoroplethMap = dynamic(() => import('@/components/ChoroplethMap'), { ssr: false })

const API = 'http://127.0.0.1:8000'

const tooltipDark = {
  borderRadius: '14px',
  border: '1px solid rgba(99,102,241,0.2)',
  background: 'rgba(8,12,30,0.97)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.7)',
  fontSize: '13px',
  color: '#e2e8f0',
  padding: '10px 14px',
}

/* ── Forecast Chart Component ─────────────────────────────── */
function ForecastAreaChart({ forecast, dataKey, color, label, formatter, unit, improvingIf = 'up' }: any) {
  const data = forecast?.data ?? []
  const metadata = forecast?.metadata ?? {}
  const historical = data.filter((d: any) => !d.is_forecast)
  const forecasted = data.filter((d: any) => d.is_forecast)
  const lastHist = historical.length > 0 ? historical[historical.length - 1] : null
  const lastFore = forecasted.length > 0 ? forecasted[forecasted.length - 1] : null

  const fmt = formatter ?? ((v: any) => `${Number(v).toFixed(2)}${unit ?? ''}`)
  const isUp = (lastFore?.nilai ?? 0) > (lastHist?.nilai ?? 0)
  const isImproving = improvingIf === 'up' ? isUp : !isUp
  const trendColor = isImproving ? '#10b981' : '#f43f5e'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm`}
              style={{ background: `${trendColor}15`, color: trendColor, border: `1px solid ${trendColor}30` }}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ background: trendColor }} />
              {isImproving ? 'Pertumbuhan Positif' : 'Perlu Perhatian'}
            </div>
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 border border-white/5">
              R²: {metadata.r_squared}
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Prediksi {label} 2028</h3>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Analisis regresi terhadap tren {metadata.n_samples} tahun terakhir memperkirakan {label.toLowerCase()} akan berlanjut <span className="text-white font-medium">{isUp ? 'meningkat' : 'menurun'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-6 border-l border-white/5 pl-8 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Aktual</p>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{fmt(lastHist?.nilai)}</p>
          </div>
          <div className="p-2 rounded-full bg-white/5 border border-white/5 text-slate-600">
            <ArrowRight size={18} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5 opacity-70">Target 2028</p>
            <p className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: trendColor }}>
              {fmt(lastFore?.nilai)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full bg-[#0a0f1e]/40 rounded-3xl p-5 border border-white/5 shadow-inner relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`gFore_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={tooltipDark}
              formatter={(v: any) => {
                const isFore = data.find(d => d.nilai === v)?.is_forecast
                return [fmt(v), isFore ? `Prediksi ${label}` : label]
              }}
              itemStyle={{ color }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
            
            <Area type="natural" dataKey="nilai_upper" data={forecasted} stroke="none" fill={trendColor} fillOpacity={0.06} />
            <Area type="natural" dataKey="nilai_lower" data={forecasted} stroke="none" fill={trendColor} fillOpacity={0.06} />

            <Area type="natural" dataKey="nilai" name={label}
              data={historical} stroke={color} strokeWidth={3}
              fillOpacity={1} fill={`url(#grad_${dataKey})`}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 7, strokeWidth: 0, fill: color }}
            />
            
            <Area type="natural" dataKey="nilai" data={forecasted}
              stroke={trendColor} strokeWidth={3} strokeDasharray="6 4"
              fill={`url(#gFore_${dataKey})`}
              dot={{ r: 5, fill: '#0a0f1e', strokeWidth: 2, stroke: trendColor }}
              autoLabel={{ distance: 10 }}
              label={(props: any) => {
                const { x, y, index, payload } = props
                if (index === 0 || index === forecasted.length - 1) {
                  return (
                    <text x={x} y={y - 15} fill={trendColor} fontSize={10} fontWeight="900" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#08101a', strokeWidth: 2 }}>
                      {fmt(payload.nilai)}
                    </text>
                  )
                }
                return null
              }}
            />
            {lastHist && <ReferenceLine x={lastHist.tahun} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {forecasted.map((f: any) => (
          <div key={f.tahun} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{f.tahun}</span>
            <span className="text-sm font-bold text-slate-300">{fmt(f.nilai)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── KPI Mini Card ─────────────────────────────────────────── */
function MiniKPI({ label, value, color, icon }: any) {
  return (
    <div className="kpi-card rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function DemografiPage() {
  const [data, setData] = useState<any>(null)
  const [geojson, setGeojson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mapTab, setMapTab] = useState<'tpt' | 'tpak'>('tpt')
  const [forecastTab, setForecastTab] = useState<'tpt' | 'tpak' | 'umk'>('tpt')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/demografi`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch(`${API}/api/geojson`).then(r => r.json()).catch(() => null),
    ])
      .then(([d, geo]) => { setData(d); setGeojson(geo); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[60vh]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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

  const kabkota: any[]    = data.kabkota ?? []
  const tptTrend: any[]  = data.tpt_trend ?? []
  const tpakTrend: any[] = data.tpak_trend ?? []
  const umkTrend: any[]  = data.umk_trend ?? []
  const forecast: any    = data.forecast ?? {}

  function withLabel(arr: any[]) {
    return arr.map(d => ({ ...d, namaLabel: d.tipe === 'Kota' ? `Kota ${d.nama}` : `Kab. ${d.nama}` }))
  }

  const kabTptSorted  = withLabel([...kabkota].sort((a, b) => (b.tpt  ?? 0) - (a.tpt  ?? 0)))
  const kabTpakSorted = withLabel([...kabkota].sort((a, b) => (b.tpak ?? 0) - (a.tpak ?? 0)))
  const kabUmkSorted  = withLabel([...kabkota].sort((a, b) => (b.umk  ?? 0) - (a.umk  ?? 0)))

  const avgTpt  = (kabkota.reduce((a, b) => a + (b.tpt ?? 0), 0)  / (kabkota.length || 1)).toFixed(2)
  const avgTpak = (kabkota.reduce((a, b) => a + (b.tpak ?? 0), 0) / (kabkota.length || 1)).toFixed(2)
  const avgUmk  = kabkota.reduce((a, b) => a + (b.umk ?? 0), 0)   / (kabkota.length || 1)
  const totalPenduduk = kabkota.reduce((a, b) => a + (b.penduduk ?? 0), 0)

  const barHeight = Math.max(500, kabkota.length * 38)

  const forecastConfigs: Record<string, any> = {
    tpt:  { forecast: forecast.tpt,  dataKey: 'tpt',  color: '#f43f5e', label: 'TPT (%)', improvingIf: 'down', fmt: (v: any) => `${Number(v).toFixed(2)}%` },
    tpak: { forecast: forecast.tpak, dataKey: 'tpak', color: '#10b981', label: 'TPAK (%)', improvingIf: 'up', fmt: (v: any) => `${Number(v).toFixed(2)}%` },
    umk:  { forecast: forecast.umk,  dataKey: 'umk',  color: '#8b5cf6', label: 'UMK (Rp)', improvingIf: 'up', fmt: (v: any) => `Rp ${Number(v).toLocaleString('id-ID')}` },
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header-accent pl-4 py-2 pr-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Demografi & Ketenagakerjaan</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tren kependudukan, pengangguran, dan upah minimum 2020–2024</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKPI label="Total Penduduk" value={`${(totalPenduduk / 1000).toFixed(2)} Jt`} color="#6366f1" icon={<Users size={16} />} />
        <MiniKPI label="Rata-rata TPT" value={`${avgTpt}%`} color="#f43f5e" icon={<Briefcase size={16} />} />
        <MiniKPI label="Rata-rata TPAK" value={`${avgTpak}%`} color="#10b981" icon={<TrendingUp size={16} />} />
        <MiniKPI label="Rata-rata UMK" value={`Rp ${(avgUmk / 1_000_000).toFixed(2)} Jt`} color="#8b5cf6" icon={<Banknote size={16} />} />
      </div>

      {/* Choropleth Map */}
      {geojson && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Map size={14} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Peta Sebaran per Kab/Kota 2024</h2>
                <p className="text-xs text-slate-600">Distribusi spasial ketenagakerjaan</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['tpt', 'tpak'] as const).map(m => (
                <button key={m} onClick={() => setMapTab(m)}
                  className={`tab-btn px-3 py-1.5 rounded-lg border ${mapTab === m ? 'active' : ''}`}>
                  {m === 'tpt' ? 'TPT (%)' : 'TPAK (%)'}
                </button>
              ))}
            </div>
          </div>
          <ChoroplethMap geojson={geojson} kabkota={kabkota} metric={mapTab} />
        </div>
      )}

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Tren TPT (Pengangguran)', data: tptTrend, key: 'TPT', color: '#f43f5e', fmt: (v: any) => `${Number(v).toFixed(2)}%`, suffix: '%' },
          { title: 'Tren TPAK (Partisipasi Kerja)', data: tpakTrend, key: 'TPAK', color: '#10b981', fmt: (v: any) => `${Number(v).toFixed(2)}%`, suffix: '%' },
        ].map(({ title, data: d, key, color, fmt, suffix }, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
              <h2 className="text-sm font-bold text-white">{title}</h2>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`lineGrad_${key}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={color} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                    tickFormatter={(v) => `${v}${suffix}`} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipDark} formatter={(v: any) => [fmt(v), key]}
                    itemStyle={{ color }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
                  <Line type="monotone" dataKey={key}
                    stroke={`url(#lineGrad_${key})`} strokeWidth={3}
                    dot={{ fill: color, strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: `${color}50`, fill: color }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* UMK Trend */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: '#8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.5)' }} />
          <h2 className="text-sm font-bold text-white">Tren UMK Rata-rata Jawa Barat (Rp)</h2>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={umkTrend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUMK" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipDark}
                formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'UMK Rata-rata']}
                itemStyle={{ color: '#8b5cf6' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Area type="monotone" dataKey="UMK"
                stroke="#8b5cf6" strokeWidth={2.5}
                fillOpacity={1} fill="url(#gradUMK)"
                dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── FORECASTING SECTION ── */}
      {(forecast.tpt?.length > 0 || forecast.tpak?.length > 0 || forecast.umk?.length > 0) && (
        <div className="forecast-section p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Activity size={14} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Proyeksi & Forecasting</h2>
                <p className="text-xs text-slate-500">Linear regression · 4 tahun ke depan dengan confidence interval 95%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400">Prediktif</span>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { key: 'tpt', label: 'TPT (Pengangguran)', color: '#f43f5e' },
              { key: 'tpak', label: 'TPAK (Partisipasi)', color: '#10b981' },
              { key: 'umk', label: 'UMK (Upah Minimum)', color: '#8b5cf6' },
            ].map(t => (
              <button key={t.key}
                onClick={() => setForecastTab(t.key as any)}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: forecastTab === t.key ? `${t.color}18` : 'transparent',
                  color: forecastTab === t.key ? t.color : '#64748b',
                  border: forecastTab === t.key ? `1px solid ${t.color}35` : '1px solid transparent',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <ForecastAreaChart
            forecast={forecastConfigs[forecastTab].forecast}
            dataKey={forecastConfigs[forecastTab].dataKey}
            color={forecastConfigs[forecastTab].color}
            label={forecastConfigs[forecastTab].label}
            formatter={forecastConfigs[forecastTab].fmt}
            improvingIf={forecastConfigs[forecastTab].improvingIf}
          />

          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-0.5 rounded-full" style={{ background: forecastConfigs[forecastTab].color }} />
              <span>Data historis</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-0.5 rounded-full border-dashed border-t border-amber-400" style={{ borderStyle: 'dashed' }} />
              <span>Proyeksi (linear regression)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded opacity-40" style={{ background: 'rgba(245,158,11,0.3)' }} />
              <span>Confidence interval 95%</span>
            </div>
          </div>
        </div>
      )}

      {/* Bar charts per region */}
      {[
        { title: 'TPT per Kab/Kota 2024 (%) — Tertinggi → Terendah', data: kabTptSorted, key: 'tpt', color: '#f43f5e', fmt: (v: any) => [`${Number(v).toFixed(2)}%`, 'TPT'] },
        { title: 'TPAK per Kab/Kota 2024 (%) — Tertinggi → Terendah', data: kabTpakSorted, key: 'tpak', color: '#10b981', fmt: (v: any) => [`${Number(v).toFixed(2)}%`, 'TPAK'] },
        { title: 'UMK per Kab/Kota 2024 (Rp) — Tertinggi → Terendah', data: kabUmkSorted, key: 'umk', color: '#8b5cf6', fmt: (v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'UMK'] },
      ].map(({ title, data: d, key, color, fmt }, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          <div style={{ height: barHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipDark} formatter={fmt as any}
                  itemStyle={{ color }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
                <Bar dataKey={key} fill={color} radius={[0, 6, 6, 0]}
                  background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 6, 6, 0] }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}
