'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  BarChart, Bar, AreaChart, Area, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { AlertCircle, Map, Road, Droplets, Activity, ArrowRight } from 'lucide-react'

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

function ForecastAreaChart({ forecast, color, label, suffix = '%', improvingIf = 'up' }: any) {
  const data = forecast?.data ?? []
  const metadata = forecast?.metadata ?? {}
  const historical = data.filter((d: any) => !d.is_forecast)
  const forecasted = data.filter((d: any) => d.is_forecast)
  const lastHist = historical.length > 0 ? historical[historical.length - 1] : null
  const lastFore = forecasted.length > 0 ? forecasted[forecasted.length - 1] : null

  const isUp = (lastFore?.nilai ?? 0) > (lastHist?.nilai ?? 0)
  const isImproving = improvingIf === 'up' ? isUp : !isUp
  const trendColor = isImproving ? '#10b981' : '#f43f5e'
  const gradientId = `gInf_${label.replace(/\s+/g, '_').replace(/[^\w]/g, '')}`

  return (
    <div className="space-y-6">
      {/* Hero Prediction Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm`}
              style={{ background: `${trendColor}15`, color: trendColor, border: `1px solid ${trendColor}30` }}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ background: trendColor }} />
              {isImproving ? 'Capaian Meningkat' : 'Perlu Perhatian'}
            </div>
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 border border-white/10">
               Akurasi: {Math.round(metadata.r_squared * 100)}%
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Proyeksi Layanan {label}</h3>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Data historis memperkirakan akses {label.toLowerCase()} akan berlanjut <span className="text-white font-medium">{isUp ? 'meningkat' : 'menurun'}</span> mencapai target 2028.
          </p>
        </div>
        <div className="flex items-center gap-6 border-l border-white/5 pl-8 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Aktual</p>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{lastHist?.nilai?.toFixed(1)}{suffix}</p>
          </div>
          <div className="p-2 rounded-full bg-white/5 border border-white/5 text-slate-600">
            <ArrowRight size={18} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 opacity-70">Target 2028</p>
            <p className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: trendColor }}>
              {lastFore?.nilai?.toFixed(1)}{suffix}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full bg-[#0a0f1e]/40 rounded-3xl p-5 border border-white/5 shadow-inner relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`gInfFore_${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
              tickFormatter={(v) => `${Number(v).toFixed(0)}${suffix}`} domain={['auto', 'auto']} />
            <Tooltip contentStyle={tooltipDark}
              formatter={(v: any) => {
                const isFore = data.find(d => d.nilai === v)?.is_forecast
                return [`${Number(v).toFixed(1)}${suffix}`, isFore ? `Prediksi ${label}` : label]
              }}
              itemStyle={{ color }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
            
            <Area type="natural" dataKey="nilai_upper" data={forecasted} stroke="none" fill={trendColor} fillOpacity={0.07} />
            <Area type="natural" dataKey="nilai_lower" data={forecasted} stroke="none" fill={trendColor} fillOpacity={0.07} />

            <Area type="natural" dataKey="nilai" name={label}
              data={historical} stroke={color} strokeWidth={3}
              fillOpacity={1} fill={`url(#${gradientId})`}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 7, strokeWidth: 0, fill: color }}
            />
            
            <Area type="natural" dataKey="nilai" data={forecasted}
              stroke={trendColor} strokeWidth={3} strokeDasharray="6 4"
              fill={`url(#gInfFore_${gradientId})`}
              dot={{ r: 5, fill: '#0a0f1e', strokeWidth: 2, stroke: trendColor }}
              autoLabel={{ distance: 10 }}
              label={(props: any) => {
                const { x, y, index, payload } = props
                if (index === 0 || index === forecasted.length - 1) {
                  return (
                    <text x={x} y={y - 15} fill={trendColor} fontSize={10} font-900 textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#08101a', strokeWidth: 2 }}>
                      {payload.nilai.toFixed(1)}{suffix}
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
            <span className="text-sm font-bold text-slate-300">{f.nilai.toFixed(1)}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InfrastrukturPage() {
  const [data, setData] = useState<any>(null)
  const [geojson, setGeojson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [forecastTab, setForecastTab] = useState<'sanitasi' | 'air'>('sanitasi')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/infrastruktur`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
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

  const kabkota: any[] = data.kabkota ?? []
  const forecast: any  = data.forecast ?? {}

  const avgSanitasi    = (kabkota.reduce((a, b) => a + (b.sanitasi ?? 0), 0) / (kabkota.length || 1)).toFixed(1)
  const avgAir         = (kabkota.reduce((a, b) => a + (b.air_minum ?? 0), 0) / (kabkota.length || 1)).toFixed(1)
  const avgJalanBaik   = (kabkota.reduce((a, b) => a + (b.pct_jln_baik ?? 0), 0) / (kabkota.length || 1)).toFixed(1)
  const totalJalanBaik = kabkota.reduce((a, b) => a + (b.jln_baik ?? 0), 0)

  function withLabel(arr: any[]) {
    return arr.map(d => ({ ...d, namaLabel: d.tipe === 'Kota' ? `Kota ${d.nama}` : `Kab. ${d.nama}` }))
  }

  const kabJalanSorted    = withLabel([...kabkota].sort((a, b) => (b.pct_jln_baik ?? 0) - (a.pct_jln_baik ?? 0)))
  const kabSanitasiSorted = withLabel([...kabkota].sort((a, b) => (b.sanitasi    ?? 0) - (a.sanitasi    ?? 0)))
  const kabkotaLabeled    = withLabel(kabkota)

  const barHeight = Math.max(500, kabkota.length * 38)

  function jalanColor(pct: number): string {
    if (pct >= 70) return '#10b981'
    if (pct >= 55) return '#3b82f6'
    if (pct >= 40) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header-accent pl-4 py-2 pr-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Infrastruktur & Layanan Dasar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Kondisi jalan, sanitasi, dan akses layanan dasar 2024</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKPI label="Sanitasi Layak" value={`${avgSanitasi}%`} color="#10b981" icon={<Droplets size={16} />} />
        <MiniKPI label="Air Minum Layak" value={`${avgAir}%`} color="#06b6d4" icon={<Droplets size={16} />} />
        <MiniKPI label="% Jalan Kondisi Baik" value={`${avgJalanBaik}%`} color="#3b82f6" icon={<Activity size={16} />} />
        <MiniKPI label="Total Jalan Baik" value={`${totalJalanBaik.toLocaleString('id-ID')} km`} color="#8b5cf6" icon={<Activity size={16} />} />
      </div>

      {/* Map */}
      {geojson && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Map size={14} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Peta % Jalan Kondisi Baik per Kab/Kota 2024</h2>
              <p className="text-xs text-slate-600">Distribusi spasial kualitas infrastruktur jalan</p>
            </div>
          </div>
          <ChoroplethMap geojson={geojson} kabkota={kabkota} metric="jalan" />
        </div>
      )}

      {/* ── FORECASTING SECTION ── */}
      {(forecast.sanitasi?.length > 0 || forecast.air?.length > 0) && (
        <div className="forecast-section p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Activity size={14} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Proyeksi & Forecasting Infrastruktur</h2>
                <p className="text-xs text-slate-500">Linear regression · 4 tahun ke depan dengan confidence interval 95%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400">AI Prediktif</span>
            </div>
          </div>

          <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { key: 'sanitasi', label: 'Proyeksi Sanitasi Layak', color: '#10b981' },
              { key: 'air',      label: 'Proyeksi Air Minum Layak', color: '#06b6d4' },
            ].map(t => (
              <button key={t.key} onClick={() => setForecastTab(t.key as any)}
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
            forecast={forecast[forecastTab]}
            color={forecastTab === 'sanitasi' ? '#10b981' : '#06b6d4'}
            label={forecastTab === 'sanitasi' ? 'Sanitasi Layak (%)' : 'Air Minum Layak (%)'}
            improvingIf="up"
          />
        </div>
      )}

      {/* % Jalan Baik chart */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
          <h2 className="text-sm font-bold text-white">Persentase Jalan Kondisi Baik per Kab/Kota (%)</h2>
        </div>
        <div className="flex items-center gap-4 mb-5 text-xs text-slate-500 flex-wrap">
          {[
            { color: '#10b981', label: '≥70% (Baik)' },
            { color: '#3b82f6', label: '55–69% (Cukup)' },
            { color: '#f59e0b', label: '40–54% (Sedang)' },
            { color: '#ef4444', label: '<40% (Perlu Perhatian)' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kabJalanSorted} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipDark}
                formatter={(v: any) => {
                  const pct = Number(v)
                  const cat = pct >= 70 ? 'Baik' : pct >= 55 ? 'Cukup' : pct >= 40 ? 'Sedang' : 'Perlu Perhatian'
                  return [`${pct.toFixed(1)}% — Kondisi ${cat}`, 'Jalan']
                }}
                itemStyle={{ color: '#a5b4fc' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="pct_jln_baik" name="% Jalan Baik" radius={[0, 6, 6, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 6, 6, 0] }}>
                {kabJalanSorted.map((d: any, i: number) => (
                  <Cell key={i} fill={jalanColor(d.pct_jln_baik ?? 0)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Komposisi kondisi jalan */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-500" style={{ boxShadow: '0 0 8px rgba(59,130,246,0.5)' }} />
          <h2 className="text-sm font-bold text-white">Komposisi Kondisi Jalan per Kab/Kota (km)</h2>
        </div>
        <div className="flex items-center gap-4 mb-5 text-xs text-slate-500 flex-wrap">
          {[
            { color: '#10b981', label: 'Jalan Baik' },
            { color: '#3b82f6', label: 'Jalan Sedang' },
            { color: '#f59e0b', label: 'Jalan Rusak' },
            { color: '#ef4444', label: 'Jalan Rusak Berat' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kabkotaLabeled} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(v) => `${v} km`} />
              <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipDark}
                formatter={(v: any, name: any) => [`${Number(v).toLocaleString('id-ID')} km`, name]}
                itemStyle={{ color: '#a5b4fc' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="jln_baik"        name="Jalan Baik"       stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="jln_sedang"      name="Jalan Sedang"     stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="jln_rusak"       name="Jalan Rusak"      stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="jln_rusak_berat" name="Jalan Rusak Berat" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sanitasi & Air */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
          <h2 className="text-sm font-bold text-white">Akses Sanitasi & Air Minum Layak per Kab/Kota (%)</h2>
        </div>
        <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981' }} /><span>Sanitasi Layak</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }} /><span>Air Minum Layak</span></div>
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kabSanitasiSorted} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipDark}
                formatter={(v: any, name: any) => [`${Number(v).toFixed(1)}%`, name]}
                itemStyle={{ color: '#10b981' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="sanitasi"  name="Sanitasi Layak"  fill="#10b981" radius={[0, 4, 4, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 4, 4, 0] }} />
              <Bar dataKey="air_minum" name="Air Minum Layak" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
