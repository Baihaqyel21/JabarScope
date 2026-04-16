'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { DollarSign, TrendingUp, AlertCircle, Map, Activity, BarChart3, ArrowRight } from 'lucide-react'

const ChoroplethMap = dynamic(() => import('@/components/ChoroplethMap'), { ssr: false })

const API = '/api'

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

function ForecastAreaChart({ forecast, dataKey, color, label, formatter, improvingIf = 'up' }: any) {
  const data = forecast?.data ?? []
  const metadata = forecast?.metadata ?? {}
  if (!data || data.length === 0) return null;
  const historical = data.filter((d: any) => !d.is_forecast)
  const forecastedRaw = data.filter((d: any) => d.is_forecast).slice(0, 4)
  const lastHist = historical.length > 0 ? historical[historical.length - 1] : null
  const lastFore = forecastedRaw.length > 0 ? forecastedRaw[forecastedRaw.length - 1] : null

  // To avoid Recharts Area gaps, we explicitly pass a continuous array to each Area.
  const forecasted = lastHist ? [lastHist, ...forecastedRaw] : forecastedRaw;
  const combinedData = [...historical, ...forecastedRaw]

  const isUp = (lastFore?.nilai ?? 0) > (lastHist?.nilai ?? 0)
  const isImproving = improvingIf === 'up' ? isUp : !isUp
  
  const badgeColor = isImproving ? '#10b981' : '#f43f5e'
  const foreColor = '#3b82f6' // Proyeksi always blue

  return (
    <div className="space-y-6">
      {/* Hero Prediction Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm`}
              style={{ background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30` }}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ background: badgeColor }} />
              {isImproving ? 'Proyeksi Positif' : 'Proyeksi Negatif'}
            </div>
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 border border-white/10">
              Regresi Linier • Akurasi {Math.round((metadata.r_squared || 0) * 100)}%
            </div>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Proyeksi {label} 2028</h3>
        </div>
        <div className="flex items-center gap-6 border-l border-white/5 pl-8 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Kondisi 2024</p>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{formatter(lastHist?.nilai)}</p>
          </div>
          <div className="p-2 rounded-full bg-white/5 border border-white/5 text-slate-600">
            <ArrowRight size={18} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5 opacity-70">Target 2028</p>
            <p className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: foreColor }}>
              {formatter(lastFore?.nilai)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full bg-[#0a0f1e]/40 rounded-3xl p-5 border border-white/5 shadow-inner relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`gEk_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={badgeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={badgeColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`gFore_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={foreColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={foreColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="tahun" type="number" scale="time" domain={['dataMin', 'dataMax']} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} tickCount={combinedData.length} tickFormatter={(v) => Math.round(v).toString()} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={tooltipDark}
              formatter={(v: any, name: any, props: any) => {
                const isFore = combinedData.find(d => d.nilai === v)?.is_forecast
                return [formatter(v), isFore ? `Prediksi ${label}` : label]
              }}
              labelFormatter={(l) => Math.round(l)}
              itemStyle={{ color }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
            
            <Area type="monotone" dataKey="nilai_upper" data={forecasted} stroke="none" fill={foreColor} fillOpacity={0.07} />
            <Area type="monotone" dataKey="nilai_lower" data={forecasted} stroke="none" fill={foreColor} fillOpacity={0.07} />

            <Area type="monotone" dataKey="nilai" name={label}
              data={historical}
              stroke={badgeColor} strokeWidth={3}
              fillOpacity={1} fill={`url(#gEk_${dataKey})`}
              dot={{ fill: badgeColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 7, strokeWidth: 0, fill: badgeColor }}
            />
            
            <Area type="monotone" dataKey="nilai"
              data={forecasted}
              stroke={foreColor} strokeWidth={3} strokeDasharray="6 4"
              fill={`url(#gFore_${dataKey})`}
              dot={{ r: 5, fill: '#0a0f1e', strokeWidth: 2, stroke: foreColor }}
              autoLabel={{ distance: 10 }}
              label={(props: any) => {
                const { x, y, index, payload } = props
                if (!payload || typeof payload.nilai !== 'number') return null;
                if (payload.tahun === forecasted[forecasted.length - 1]?.tahun) {
                  return (
                    <text x={x} y={y - 15} fill={badgeColor} fontSize={10} fontWeight="900" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#08101a', strokeWidth: 2 }}>
                      {formatter(payload.nilai)}
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
            <span className="text-sm font-bold text-slate-300">{formatter(f.nilai)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EkonomiPage() {
  const [data, setData] = useState<any>(null)
  const [geojson, setGeojson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mapTab, setMapTab] = useState<'pdrb' | 'growth'>('pdrb')
  const [forecastTab, setForecastTab] = useState<'pdrb' | 'growth'>('pdrb')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/ekonomi`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
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

  const kabkota: any[]     = data.kabkota ?? []
  const pdrbTrend: any[]   = data.pdrb_trend ?? []
  const growthTrend: any[] = data.growth_trend ?? []
  const forecast: any      = data.forecast ?? {}

  function withLabel(arr: any[]) {
    return arr.map(d => ({ ...d, namaLabel: d.tipe === 'Kota' ? `Kota ${d.nama}` : `Kab. ${d.nama}` }))
  }

  const kabPdrbSorted   = withLabel([...kabkota].sort((a, b) => (b.pdrb_kapita      ?? 0) - (a.pdrb_kapita      ?? 0)))
  const kabGrowthSorted = withLabel([...kabkota].sort((a, b) => (b.pertumbuhan_pdrb ?? 0) - (a.pertumbuhan_pdrb ?? 0)))

  const avgPdrb   = kabkota.reduce((a, b) => a + (b.pdrb_kapita ?? 0), 0) / (kabkota.length || 1)
  const avgGrowth = kabkota.reduce((a, b) => a + (b.pertumbuhan_pdrb ?? 0), 0) / (kabkota.length || 1)
  const maxPdrb   = Math.max(...kabkota.map((k: any) => k.pdrb_kapita ?? 0))
  const minPdrb   = Math.min(...kabkota.map((k: any) => k.pdrb_kapita ?? 0))

  const barHeight = Math.max(400, kabkota.length * 38)

  const forecastConfigs = {
    pdrb:   { color: '#3b82f6', label: 'PDRB/Kapita (Rb Rp)', improvingIf: 'up', fmt: (v: any) => `Rp ${Number(v).toFixed(0)} Rb` },
    growth: { color: '#10b981', label: 'Pertumbuhan PDRB (%)', improvingIf: 'up', fmt: (v: any) => `${Number(v).toFixed(2)}%` },
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header-accent pl-4 py-2 pr-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Ekonomi Daerah</h1>
        <p className="text-slate-500 text-sm mt-0.5">PDRB per kapita, pertumbuhan ekonomi, dan disparitas pendapatan</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKPI label="Rata-rata PDRB/Kapita" value={`Rp ${(avgPdrb / 1000).toFixed(0)} Jt`} color="#3b82f6" icon={<DollarSign size={16} />} />
        <MiniKPI label="Pertumbuhan Rata-rata" value={`${avgGrowth.toFixed(2)}%`} color="#10b981" icon={<TrendingUp size={16} />} />
        <MiniKPI label="PDRB/Kapita Tertinggi" value={`Rp ${(maxPdrb / 1000).toFixed(0)} Jt`} color="#8b5cf6" icon={<BarChart3 size={16} />} />
        <MiniKPI label="PDRB/Kapita Terendah" value={`Rp ${(minPdrb / 1000).toFixed(0)} Jt`} color="#f59e0b" icon={<BarChart3 size={16} />} />
      </div>

      {/* Map */}
      {geojson && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <Map size={14} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Peta Sebaran Ekonomi per Kab/Kota 2024</h2>
                <p className="text-xs text-slate-600">Distribusi spasial PDRB dan pertumbuhan</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['pdrb', 'growth'] as const).map(m => (
                <button key={m} onClick={() => setMapTab(m)}
                  className={`tab-btn px-3 py-1.5 rounded-lg border ${mapTab === m ? 'active' : ''}`}>
                  {m === 'pdrb' ? 'PDRB/Kapita' : 'Pertumbuhan'}
                </button>
              ))}
            </div>
          </div>
          <ChoroplethMap geojson={geojson} kabkota={kabkota} metric={mapTab === 'pdrb' ? 'pdrb' : 'growth'} />
        </div>
      )}

      {/* Trend Forecasts (Replacing old non-forecast line charts) */}
      <div className="grid grid-cols-1 gap-6">
        <ForecastAreaChart
          forecast={forecast.pdrb} dataKey="pdrb" color="#3b82f6" label="PDRB per Kapita" 
          formatter={(v: any) => `Rp ${Number(v).toLocaleString('id-ID')}`}
        />
        <ForecastAreaChart
          forecast={forecast.growth} dataKey="growth" color="#10b981" label="Pertumbuhan Ekonomi" 
          formatter={(v: any) => `${Number(v).toFixed(2)}%`}
        />
      </div>

      {/* Bar charts per region */}
      {[
        { title: 'PDRB per Kapita per Kab/Kota 2024 (Ribu Rp) — Tertinggi → Terendah', data: kabPdrbSorted, key: 'pdrb_kapita', color: '#6366f1', fmt: (v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'PDRB/Kapita'], tick: (v: any) => `${(v / 1000).toFixed(0)}k` },
        { title: 'Laju Pertumbuhan PDRB per Kab/Kota 2024 (%) — Tertinggi → Terendah', data: kabGrowthSorted, key: 'pertumbuhan_pdrb', color: '#10b981', fmt: (v: any) => [`${Number(v).toFixed(2)}%`, 'Pertumbuhan'], tick: (v: any) => `${v}%` },
      ].map(({ title, data: d, key, color, fmt, tick }, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          <div style={{ height: barHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                  tickFormatter={tick} />
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
