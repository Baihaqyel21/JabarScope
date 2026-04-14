'use client'

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export type MapMetric = 'composite' | 'tpt' | 'tpak' | 'ipm' | 'pdrb' | 'jalan' | 'miskin' | 'growth'

interface LegendItem { color: string; label: string }

interface Props {
  geojson: any
  kabkota: any[]
  metric: MapMetric
}

// ── Colour scales ─────────────────────────────────────────────────────────────

function getColor(value: number | null | undefined, metric: MapMetric): string {
  if (value === null || value === undefined) return '#e2e8f0'

  switch (metric) {
    case 'composite':
      if (value >= 75) return '#1d4ed8'
      if (value >= 60) return '#3b82f6'
      if (value >= 45) return '#93c5fd'
      if (value >= 30) return '#bfdbfe'
      return '#dbeafe'

    case 'tpt': // % pengangguran — merah makin tinggi makin buruk
      if (value >= 12) return '#991b1b'
      if (value >= 9)  return '#ef4444'
      if (value >= 6)  return '#fca5a5'
      if (value >= 3)  return '#fde68a'
      return '#a7f3d0'

    case 'tpak': // % partisipasi — hijau makin tinggi makin baik
      if (value >= 70) return '#065f46'
      if (value >= 65) return '#059669'
      if (value >= 60) return '#6ee7b7'
      if (value >= 55) return '#d1fae5'
      return '#ecfdf5'

    case 'ipm': // makin tinggi makin baik
      if (value >= 80) return '#1d4ed8'
      if (value >= 75) return '#3b82f6'
      if (value >= 70) return '#93c5fd'
      if (value >= 65) return '#bfdbfe'
      return '#dbeafe'

    case 'miskin': // % miskin — merah makin tinggi makin buruk
      if (value >= 12) return '#991b1b'
      if (value >= 8)  return '#ef4444'
      if (value >= 5)  return '#fca5a5'
      if (value >= 3)  return '#fde68a'
      return '#a7f3d0'

    case 'pdrb': // ribu Rp — makin tinggi makin baik
      if (value >= 100000) return '#065f46'
      if (value >= 50000)  return '#059669'
      if (value >= 30000)  return '#6ee7b7'
      if (value >= 15000)  return '#d1fae5'
      return '#ecfdf5'

    case 'jalan': // % jalan baik
      if (value >= 70) return '#059669'
      if (value >= 55) return '#3b82f6'
      if (value >= 40) return '#f59e0b'
      return '#ef4444'

    case 'growth': // % pertumbuhan
      if (value >= 6) return '#065f46'
      if (value >= 5) return '#059669'
      if (value >= 4) return '#10b981'
      if (value >= 3) return '#6ee7b7'
      return '#d1fae5'

    default:
      return '#e2e8f0'
  }
}

const LEGEND_ITEMS: Record<MapMetric, LegendItem[]> = {
  composite: [
    { color: '#1d4ed8', label: '>=75 (Sangat Tinggi)' },
    { color: '#3b82f6', label: '60-74 (Tinggi)' },
    { color: '#93c5fd', label: '45-59 (Sedang)' },
    { color: '#bfdbfe', label: '30-44 (Rendah)' },
    { color: '#dbeafe', label: '<30 (Sangat Rendah)' },
  ],
  tpt: [
    { color: '#a7f3d0', label: '<3% (Sangat Rendah)' },
    { color: '#fde68a', label: '3-5% (Rendah)' },
    { color: '#fca5a5', label: '6-8% (Sedang)' },
    { color: '#ef4444', label: '9-11% (Tinggi)' },
    { color: '#991b1b', label: '>=12% (Sangat Tinggi)' },
  ],
  tpak: [
    { color: '#ecfdf5', label: '<55% (Sangat Rendah)' },
    { color: '#d1fae5', label: '55-59% (Rendah)' },
    { color: '#6ee7b7', label: '60-64% (Sedang)' },
    { color: '#059669', label: '65-69% (Tinggi)' },
    { color: '#065f46', label: '>=70% (Sangat Tinggi)' },
  ],
  ipm: [
    { color: '#1d4ed8', label: '>=80 (Sangat Tinggi)' },
    { color: '#3b82f6', label: '75-79 (Tinggi)' },
    { color: '#93c5fd', label: '70-74 (Sedang)' },
    { color: '#bfdbfe', label: '65-69 (Rendah)' },
    { color: '#dbeafe', label: '<65 (Sangat Rendah)' },
  ],
  miskin: [
    { color: '#a7f3d0', label: '<3% (Sangat Rendah)' },
    { color: '#fde68a', label: '3-4% (Rendah)' },
    { color: '#fca5a5', label: '5-7% (Sedang)' },
    { color: '#ef4444', label: '8-11% (Tinggi)' },
    { color: '#991b1b', label: '>=12% (Sangat Tinggi)' },
  ],
  pdrb: [
    { color: '#065f46', label: '>=100 Jt (Sangat Tinggi)' },
    { color: '#059669', label: '50-99 Jt (Tinggi)' },
    { color: '#6ee7b7', label: '30-49 Jt (Sedang)' },
    { color: '#d1fae5', label: '15-29 Jt (Rendah)' },
    { color: '#ecfdf5', label: '<15 Jt (Sangat Rendah)' },
  ],
  jalan: [
    { color: '#059669', label: '>=70% (Baik)' },
    { color: '#3b82f6', label: '55-69% (Cukup)' },
    { color: '#f59e0b', label: '40-54% (Sedang)' },
    { color: '#ef4444', label: '<40% (Perlu Perhatian)' },
  ],
  growth: [
    { color: '#065f46', label: '>=6% (Sangat Tinggi)' },
    { color: '#059669', label: '5-5.9% (Tinggi)' },
    { color: '#10b981', label: '4-4.9% (Sedang)' },
    { color: '#6ee7b7', label: '3-3.9% (Rendah)' },
    { color: '#d1fae5', label: '<3% (Sangat Rendah)' },
  ],
}

const METRIC_FIELD: Record<MapMetric, string> = {
  composite: 'skor_komposit',
  tpt: 'tpt',
  tpak: 'tpak',
  ipm: 'ipm',
  miskin: 'pct_miskin',
  pdrb: 'pdrb_kapita',
  jalan: 'pct_jln_baik',
  growth: 'pertumbuhan_pdrb',
}

const METRIC_FORMAT: Record<MapMetric, (v: number) => string> = {
  composite: (v) => v.toFixed(1),
  tpt:  (v) => `${v.toFixed(2)}%`,
  tpak: (v) => `${v.toFixed(2)}%`,
  ipm:  (v) => v.toFixed(2),
  miskin: (v) => `${v.toFixed(2)}%`,
  pdrb: (v) => `Rp ${(v / 1000).toFixed(0)} Jt`,
  jalan: (v) => `${v.toFixed(1)}%`,
  growth: (v) => `${v.toFixed(2)}%`,
}

const METRIC_LABEL: Record<MapMetric, string> = {
  composite: 'Skor Komposit',
  tpt:  'TPT (%)',
  tpak: 'TPAK (%)',
  ipm:  'IPM',
  miskin: '% Miskin',
  pdrb: 'PDRB/Kapita',
  jalan: '% Jalan Baik',
  growth: 'Pertumbuhan (%)',
}

// ── Build lookup from kabkota rows ────────────────────────────────────────────
// Supports matching by: Kode BPS, nama (short), full name (without Kab./Kota prefix)
function buildLookup(kabkota: any[]): Record<string, any> {
  const lk: Record<string, any> = {}
  kabkota.forEach((d: any) => {
    // Primary: Kode BPS string (e.g. "3204")
    if (d['Kode BPS'] != null) lk[String(d['Kode BPS'])] = d

    // Fallback: multiple name normalizations
    const addName = (s: string | null | undefined) => {
      if (!s) return
      // normalise: lowercase, remove spaces, dots, "kab", "kota"
      const norm = String(s).toLowerCase()
        .replace(/\./g, '').replace(/\s+/g, '').replace(/^kab/, '').replace(/^kota/, '').trim()
      lk[norm] = d
      // Also store with spaces preserved but lowercased
      lk[String(s).toLowerCase().trim()] = d
    }
    addName(d.nama)
    addName(d['Nama Pendek'])
    addName(d['Nama Kab/Kota'])
  })
  return lk
}

function getFeatureData(feature: any, lookup: Record<string, any>): any {
  const props = feature?.properties ?? {}

  // 1. Try CC_2 (e.g. "3204") — most reliable
  const cc2 = String(props.CC_2 ?? '').trim()
  if (cc2 && lookup[cc2]) return lookup[cc2]

  // 2. Try NAME_2 with same normalization
  const name2 = String(props.NAME_2 ?? props.KABUPATEN ?? props.kabupaten ?? '')
  if (name2) {
    const norm = name2.toLowerCase().replace(/\./g, '').replace(/\s+/g, '').replace(/^kab/, '').replace(/^kota/, '').trim()
    if (lookup[norm]) return lookup[norm]
    if (lookup[name2.toLowerCase().trim()]) return lookup[name2.toLowerCase().trim()]
  }

  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChoroplethMap({ geojson, kabkota, metric }: Props) {
  const field  = METRIC_FIELD[metric]
  const fmt    = METRIC_FORMAT[metric]
  const legendItems = LEGEND_ITEMS[metric]

  const lookup = buildLookup(kabkota)

  return (
    <div className="rounded-xl overflow-hidden">
      <div style={{ height: 340 }}>
        <MapContainer
          center={[-6.9, 107.6]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.18}
          />
          <GeoJSON
            key={`${metric}-${kabkota.length}`}
            data={geojson}
            style={(feature: any) => {
              const row = getFeatureData(feature, lookup)
              const val = row ? (row[field] ?? null) : null
              return {
                fillColor: getColor(val, metric),
                weight: 1.5,
                opacity: 1,
                color: '#ffffff',
                fillOpacity: 0.85,
              }
            }}
            onEachFeature={(feature: any, layer: any) => {
              const props = feature?.properties ?? {}
              const row = getFeatureData(feature, lookup)

              // Prefer data row's nama, fallback to GeoJSON NAME_2
              const namaDisplay =
                row?.nama ??
                row?.['Nama Pendek'] ??
                props.NAME_2 ??
                props.KABUPATEN ??
                'N/A'

              const val    = row ? (row[field] ?? null) : null
              const valStr = val !== null ? fmt(Number(val)) : 'N/A'

              layer.bindTooltip(
                `<div style="font-family:Inter,sans-serif;min-width:150px;padding:4px">
                  <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:#1e293b">${namaDisplay}</p>
                  <p style="font-size:12px;color:#475569;margin:0">
                    ${METRIC_LABEL[metric]}: <strong style="color:#2563eb">${valStr}</strong>
                  </p>
                </div>`,
                { sticky: true, className: 'leaflet-tooltip-custom', direction: 'top' }
              )
              layer.on({
                mouseover: (e: any) => e.target.setStyle({ weight: 2.5, fillOpacity: 1, color: '#3b82f6' }),
                mouseout:  (e: any) => e.target.setStyle({ weight: 1.5, fillOpacity: 0.85, color: '#ffffff' }),
              })
            }}
          />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
        <span className="font-semibold text-slate-600">{METRIC_LABEL[metric]}:</span>
        {legendItems.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
