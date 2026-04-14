'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Heart, Droplets, Star, AlertCircle, Map, Activity, TrendingDown, ArrowRight } from 'lucide-react'

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

function ForecastAreaChart({ forecast, dataKey, color, label, suffix = '', improvingIf = 'up' }: any) {
  const data = forecast?.data ?? []
  const metadata = forecast?.metadata ?? {}
  const historical = data.filter((d: any) => !d.is_forecast)
  const forecasted = data.filter((d: any) => d.is_forecast)
  const lastHist = historical.length > 0 ? historical[historical.length - 1] : null
  const lastFore = forecasted.length > 0 ? forecasted[forecasted.length - 1] : null

  const isUp = (lastFore?.nilai ?? 0) > (lastHist?.nilai ?? 0)
  const isImproving = improvingIf === 'up' ? isUp : !isUp
  const trendColor = isImproving ? '#10b981' : '#f43f5e'

  return (
    <div className="space-y-6">
      {/* Hero Prediction Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm`}
              style={{ background: `${trendColor}15`, color: trendColor, border: `1px solid ${trendColor}30` }}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ background: trendColor }} />
              {isImproving ? 'Proyeksi Positif' : 'Perlu Perhatian'}
            </div>
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 border border-white/5">
              R²: {metadata.r_squared}
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            Estimasi tren {label} hingga 2028
          </h3>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Berdasarkan data historis {metadata.n_samples} tahun terakhir, {label.toLowerCase()} diprediksi akan <span className="text-white font-medium">{isUp ? 'meningkat' : 'menurun'}</span> secara {metadata.r_squared > 0.8 ? 'konsisten' : 'gradual'}.
          </p>
        </div>
        <div className="flex items-center gap-6 border-l border-white/5 pl-8 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Awal (2024)</p>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{lastHist?.nilai?.toFixed(2)}{suffix}</p>
          </div>
          <div className="p-2 rounded-full bg-white/5 border border-white/5 text-slate-600">
            <ArrowRight size={18} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 opacity-70">Prediksi (2028)</p>
            <p className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: trendColor }}>
              {lastFore?.nilai?.toFixed(2)}{suffix}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full bg-[#0a0f1e]/40 rounded-3xl p-5 border border-white/5 shadow-inner relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`gHist_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`gFore_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
              tickFormatter={(v) => `${Number(v).toFixed(1)}${suffix}`} domain={['auto', 'auto']} />
            <Tooltip contentStyle={tooltipDark}
              formatter={(v: any) => {
                const isFore = data.find(d => d.nilai === v)?.is_forecast
                return [`${Number(v).toFixed(2)}${suffix}`, isFore ? `Prediksi ${label}` : label]
              }}
              itemStyle={{ color }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
            
            {/* Confidence Interval Shaded Area */}
            <Area type="natural" dataKey="nilai_upper" data={forecasted} stroke="none" fill={trendColor} fillOpacity={0.07} />
            <Area type="natural" dataKey="nilai_lower" data={forecasted} stroke="none" fill={trendColor} fillOpacity={0.07} />

            <Area type="natural" dataKey="nilai" name={label}
              data={historical}
              stroke={color} strokeWidth={3}
              fillOpacity={1} fill={`url(#gHist_${dataKey})`}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 7, strokeWidth: 0, fill: color }}
            />
            
            <Area type="natural" dataKey="nilai" data={forecasted}
              stroke={trendColor} strokeWidth={3} strokeDasharray="6 4"
              fill={`url(#gFore_${dataKey})`}
              dot={{ r: 5, fill: '#0a0f1e', strokeWidth: 2, stroke: trendColor }}
              activeDot={{ r: 8, strokeWidth: 0, fill: trendColor }}
              label={(props: any) => {
                const { x, y, index, payload } = props
                if (index === 0 || index === forecasted.length - 1) {
                  return (
                    <text x={x} y={y - 15} fill={trendColor} fontSize={10} fontWeight="900" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#08101a', strokeWidth: 2 }}>
                      {payload.nilai.toFixed(1)}{suffix}
                    </text>
                  )
                }
                return null
              }}
            />

            {lastHist && (
              <ReferenceLine x={lastHist.tahun} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Value List Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {forecasted.map((f: any) => (
          <div key={f.tahun} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{f.tahun}</span>
            <span className="text-sm font-bold text-slate-300">{f.nilai.toFixed(2)}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KesejahteraanPage() {
  const [data, setData] = useState<any>(null)
  const [geojson, setGeojson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mapTab, setMapTab] = useState<'ipm' | 'miskin'>('ipm')
  const [forecastTab, setForecastTab] = useState<'ipm' | 'miskin'>('ipm')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/kesejahteraan`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
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

  const kabkota: any[]      = data.kabkota ?? []
  const ipmTrend: any[]     = data.ipm_trend ?? []
  const miskinTrend: any[]  = data.miskin_trend ?? []
  const forecast: any       = data.forecast ?? {}

  function withLabel(arr: any[]) {
    return arr.map(d => ({ ...d, namaLabel: d.tipe === 'Kota' ? `Kota ${d.nama}` : `Kab. ${d.nama}` }))
  }

  const kabIpmSorted      = withLabel([...kabkota].sort((a, b) => (b.ipm        ?? 0) - (a.ipm        ?? 0)))
  const kabMiskinSorted   = withLabel([...kabkota].sort((a, b) => (b.pct_miskin ?? 0) - (a.pct_miskin ?? 0)))
  const kabSanitasiSorted = withLabel([...kabkota].sort((a, b) => (b.sanitasi   ?? 0) - (a.sanitasi   ?? 0)))

  const avgIpm      = (kabkota.reduce((a, b) => a + (b.ipm        ?? 0), 0) / (kabkota.length || 1)).toFixed(2)
  const avgMiskin   = (kabkota.reduce((a, b) => a + (b.pct_miskin ?? 0), 0) / (kabkota.length || 1)).toFixed(2)
  const avgSanitasi = (kabkota.reduce((a, b) => a + (b.sanitasi   ?? 0), 0) / (kabkota.length || 1)).toFixed(1)
  const avgAir      = (kabkota.reduce((a, b) => a + (b.air_minum  ?? 0), 0) / (kabkota.length || 1)).toFixed(1)

  const barHeight = Math.max(500, kabkota.length * 38)

  const combinedTrend = ipmTrend.map((item: any) => {
    const m = miskinTrend.find((x: any) => x.tahun === item.tahun)
    return { ...item, Kemiskinan: m?.Kemiskinan ?? null }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header-accent pl-4 py-2 pr-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Kesejahteraan Masyarakat</h1>
        <p className="text-slate-500 text-sm mt-0.5">IPM, kemiskinan, sanitasi, dan akses air minum layak</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKPI label="Rata-rata IPM" value={avgIpm} color="#3b82f6" icon={<Star size={16} />} />
        <MiniKPI label="% Penduduk Miskin" value={`${avgMiskin}%`} color="#f43f5e" icon={<Heart size={16} />} />
        <MiniKPI label="Sanitasi Layak" value={`${avgSanitasi}%`} color="#10b981" icon={<Droplets size={16} />} />
        <MiniKPI label="Air Minum Layak" value={`${avgAir}%`} color="#06b6d4" icon={<Droplets size={16} />} />
      </div>

      {/* Map */}
      {geojson && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <Map size={14} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Peta Sebaran Kesejahteraan per Kab/Kota 2024</h2>
                <p className="text-xs text-slate-600">Distribusi spasial IPM dan kemiskinan</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['ipm', 'miskin'] as const).map(m => (
                <button key={m} onClick={() => setMapTab(m)}
                  className={`tab-btn px-3 py-1.5 rounded-lg border ${mapTab === m ? 'active' : ''}`}>
                  {m === 'ipm' ? 'IPM' : '% Miskin'}
                </button>
              ))}
            </div>
          </div>
          <ChoroplethMap geojson={geojson} kabkota={kabkota} metric={mapTab} />
        </div>
      )}

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-blue-500" style={{ boxShadow: '0 0 8px rgba(59,130,246,0.5)' }} />
            <h2 className="text-sm font-bold text-white">Tren IPM Provinsi Jawa Barat</h2>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedTrend} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIPMK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipDark} formatter={(v: any) => [Number(v).toFixed(2), 'IPM']}
                  itemStyle={{ color: '#3b82f6' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
                <Area type="monotone" dataKey="IPM" stroke="#3b82f6" strokeWidth={2.5}
                  fillOpacity={1} fill="url(#gradIPMK)" dot={{ fill: '#3b82f6', strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-rose-500" style={{ boxShadow: '0 0 8px rgba(244,63,94,0.5)' }} />
            <h2 className="text-sm font-bold text-white">Tren Kemiskinan Jawa Barat (%)</h2>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedTrend} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMiskinK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                  domain={['auto', 'auto']} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipDark} formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Kemiskinan']}
                  itemStyle={{ color: '#f43f5e' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
                <Area type="monotone" dataKey="Kemiskinan" stroke="#f43f5e" strokeWidth={2.5}
                  fillOpacity={1} fill="url(#gradMiskinK)" dot={{ fill: '#f43f5e', strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── FORECASTING SECTION ── */}
      {(forecast.ipm?.length > 0 || forecast.miskin?.length > 0) && (
        <div className="forecast-section p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <TrendingDown size={14} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Proyeksi & Forecasting Kesejahteraan</h2>
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
              { key: 'ipm', label: 'Proyeksi IPM', color: '#3b82f6' },
              { key: 'miskin', label: 'Proyeksi Kemiskinan', color: '#f43f5e' },
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
            data={forecast[forecastTab] ?? []}
            dataKey={forecastTab}
            color={forecastTab === 'ipm' ? '#3b82f6' : '#f43f5e'}
            label={forecastTab === 'ipm' ? 'IPM' : 'Kemiskinan (%)'}
            suffix={forecastTab === 'miskin' ? '%' : ''}
          />

          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 h-0.5 rounded-full" style={{ background: forecastTab === 'ipm' ? '#3b82f6' : '#f43f5e' }} />
              <span>Data historis</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-6 border-t border-amber-400" style={{ borderStyle: 'dashed' }} />
              <span>Proyeksi (linear regression)</span>
            </div>
          </div>
        </div>
      )}

      {/* Bar charts per region */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-blue-500" style={{ boxShadow: '0 0 8px rgba(59,130,246,0.5)' }} />
          <h2 className="text-sm font-bold text-white">IPM per Kab/Kota 2024 — Tertinggi → Terendah</h2>
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kabIpmSorted} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} domain={['auto', 'auto']} />
              <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipDark} formatter={(v: any) => [Number(v).toFixed(2), 'IPM']}
                itemStyle={{ color: '#3b82f6' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="ipm" fill="#3b82f6" radius={[0, 6, 6, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 6, 6, 0] }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-rose-500" style={{ boxShadow: '0 0 8px rgba(244,63,94,0.5)' }} />
          <h2 className="text-sm font-bold text-white">% Penduduk Miskin per Kab/Kota 2024 — Tertinggi → Terendah</h2>
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kabMiskinSorted} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipDark} formatter={(v: any) => [`${Number(v).toFixed(2)}%`, '% Miskin']}
                itemStyle={{ color: '#f43f5e' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="pct_miskin" fill="#f43f5e" radius={[0, 6, 6, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 6, 6, 0] }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
          <h2 className="text-sm font-bold text-white">Akses Sanitasi & Air Minum Layak per Kab/Kota 2024 (%)</h2>
        </div>
        <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981' }} />
            <span>Sanitasi Layak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }} />
            <span>Air Minum Layak</span>
          </div>
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kabSanitasiSorted} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="namaLabel" width={125} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipDark} formatter={(v: any, name: any) => [`${Number(v).toFixed(1)}%`, name]}
                itemStyle={{ color: '#10b981' }} labelStyle={{ color: '#e2e8f0', fontWeight: 700 }} />
              <Bar dataKey="sanitasi" name="Sanitasi Layak" fill="#10b981" radius={[0, 4, 4, 0]}
                background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 4, 4, 0] }} />
              <Bar dataKey="air_minum" name="Air Minum Layak" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
