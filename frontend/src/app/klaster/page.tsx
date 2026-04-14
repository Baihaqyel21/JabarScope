'use client'

import { useState, useEffect } from 'react'
import {
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis
} from 'recharts'
import { AlertTriangle, Users, CheckCircle, AlertCircle, Layers, Target, Brain } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const CLUSTER_COLORS: Record<string, string> = {
  'Klaster 1': '#10b981',
  'Klaster 2': '#6366f1',
  'Klaster 3': '#f59e0b',
  'Klaster 4': '#f43f5e',
}

const CLUSTER_BG: Record<string, string> = {
  'Klaster 1': 'rgba(16,185,129,0.1)',
  'Klaster 2': 'rgba(99,102,241,0.1)',
  'Klaster 3': 'rgba(245,158,11,0.1)',
  'Klaster 4': 'rgba(244,63,94,0.1)',
}

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

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    const color = CLUSTER_COLORS[d.Klaster] ?? '#94a3b8'
    return (
      <div className="rounded-xl p-3" style={{
        ...tooltipDark,
        border: `1px solid ${color}35`,
        background: 'rgba(8,12,30,0.97)',
      }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
          <p className="font-bold text-white text-sm">{d['Nama Kab/Kota']}</p>
        </div>
        <p className="text-xs mb-2" style={{ color }}>{d.Klaster}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>PC1: <b className="text-slate-200">{Number(d.PC1).toFixed(2)}</b></span>
          <span>PC2: <b className="text-slate-200">{Number(d.PC2).toFixed(2)}</b></span>
        </div>
      </div>
    )
  }
  return null
}

export default function KlasterPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/clustering`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[60vh]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-2 border-2 border-violet-500/30 border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
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

  const scatterPoints: any[] = data.data ?? []
  const recs: Record<string, string> = data.recs ?? {}
  const summary: any[] = data.summary ?? []
  const silhouette: number = data.silhouette ?? 0
  const bestK: number = data.best_k ?? 0
  const varRatio: number[] = data.var_ratio ?? []

  const klasters = Array.from(new Set(scatterPoints.map((d: any) => d.Klaster))).sort() as string[]

  // Extract the label from recs (first part before the " — ")
  function extractLabel(kl: string) {
    const rec = recs[kl] ?? ''
    const match = rec.match(/\*\*(.*?)\*\*/)
    return match ? match[1] : kl
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header-accent pl-4 py-2 pr-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Analisis Klaster Pembangunan</h1>
        <p className="text-slate-500 text-sm mt-0.5">K-Means + Agglomerative Clustering · PCA 2D Visualization</p>
      </div>

      {/* Model metrics banner */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={14} className="text-violet-400" />
          <h2 className="text-sm font-bold text-white">Performa Model Clustering</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Silhouette Score',
              value: silhouette.toFixed(4),
              sublabel: silhouette > 0.7 ? '✓ Sangat Baik (>0.7)' : silhouette > 0.5 ? 'Baik (>0.5)' : 'Cukup',
              color: silhouette > 0.7 ? '#10b981' : silhouette > 0.5 ? '#f59e0b' : '#f43f5e',
            },
            {
              label: 'Jumlah Klaster (k)',
              value: `${bestK} klaster`,
              sublabel: 'k optimal (dipilih otomatis)',
              color: '#6366f1',
            },
            {
              label: 'Variansi PC1',
              value: varRatio.length > 0 ? `${(varRatio[0] * 100).toFixed(1)}%` : 'N/A',
              sublabel: 'Explained variance PC1',
              color: '#3b82f6',
            },
            {
              label: 'Variansi PC2',
              value: varRatio.length > 1 ? `${(varRatio[1] * 100).toFixed(1)}%` : 'N/A',
              sublabel: 'Explained variance PC2',
              color: '#8b5cf6',
            },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-4" style={{
              background: `${m.color}08`,
              border: `1px solid ${m.color}25`,
            }}>
              <p className="text-xs text-slate-500 mb-1">{m.label}</p>
              <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] mt-1" style={{ color: `${m.color}90` }}>{m.sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Klaster Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {klasters.map((kl) => {
          const count = scatterPoints.filter((d: any) => d.Klaster === kl).length
          const color = CLUSTER_COLORS[kl] ?? '#94a3b8'
          const label = extractLabel(kl)
          return (
            <div key={kl} className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-15 blur-2xl pointer-events-none"
                style={{ background: color, transform: 'translate(30%, -30%)' }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                <p className="text-xs font-bold text-slate-400">{kl}</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{count}</p>
              <p className="text-xs text-slate-500 font-medium">Daerah</p>
              <p className="text-[10px] mt-2 font-semibold" style={{ color: `${color}cc` }}>{label}</p>
            </div>
          )
        })}
      </div>

      {/* Scatter PCA + Rekomendasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Target size={14} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Persebaran Klaster (PCA 2D)</h2>
                <p className="text-xs text-slate-600">{scatterPoints.length} daerah · Dimensi direduksi PCA</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {klasters.map(kl => (
                <div key={kl} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[kl], boxShadow: `0 0 5px ${CLUSTER_COLORS[kl]}80` }} />
                  {kl}
                </div>
              ))}
            </div>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="PC1" name="PC1" axisLine={false} tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  label={{ value: 'PC1', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 11 }} />
                <YAxis type="number" dataKey="PC2" name="PC2" axisLine={false} tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }} />
                <ZAxis range={[90, 90]} />
                <Tooltip content={<CustomScatterTooltip />} />
                {klasters.map(kl => (
                  <Scatter key={kl} name={kl}
                    data={scatterPoints.filter((d: any) => d.Klaster === kl)}
                    fill={CLUSTER_COLORS[kl] ?? '#94a3b8'}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rekomendasi */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Rekomendasi Kebijakan</h2>
              <p className="text-xs text-slate-500">Berbasis profil klaster</p>
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
            {Object.entries(recs).map(([klaster, rec], idx) => {
              const color = CLUSTER_COLORS[klaster] ?? '#94a3b8'
              const label = extractLabel(klaster)
              // Strip markdown bold markers
              const cleanRec = (rec as string).replace(/\*\*.*?\*\* — /, '')
              return (
                <div key={idx} className="p-4 rounded-xl" style={{
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
                    <div>
                      <span className="text-xs font-bold" style={{ color }}>{klaster}</span>
                      <span className="text-[10px] text-slate-500 ml-2">· {label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{cleanRec}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Daftar Anggota Klaster */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Users size={14} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Komposisi Kab/Kota per Klaster</h2>
            <p className="text-xs text-slate-600">Daftar lengkap anggota setiap klaster pembangunan</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s: any, i: number) => {
            const color = CLUSTER_COLORS[s.Klaster] ?? '#94a3b8'
            const label = extractLabel(s.Klaster)
            return (
              <div key={i} className="rounded-xl p-4" style={{
                background: `${color}06`,
                border: `1px solid ${color}20`,
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
                    <p className="text-sm font-bold text-white">{s.Klaster}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                    background: `${color}15`, color, border: `1px solid ${color}30`
                  }}>
                    {(s.anggota as string[]).length} daerah
                  </span>
                </div>
                <p className="text-[10px] mb-3 font-semibold" style={{ color: `${color}aa` }}>{label}</p>
                <ul className="space-y-1.5">
                  {(s.anggota as string[]).map((a, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle size={11} style={{ color }} className="flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
