'use client'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { money, moneyCompact, moneyWhole } from '@/lib/format'

export const CLASS_COLORS = {
  Stocks: '#7c4dff',
  ETFs: '#b392ff',
  'Mutual Funds': '#dccdff',
  Bonds: '#2ee59d',
  Cash: '#9aa4d6',
}

const axisTick = { fill: 'var(--muted)', fontSize: 12 }

const fmtTick = (range) => (t) => {
  const d = new Date(t)
  if (range === '1D') return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short' })
  if (range === '1Y' || range === 'ALL') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const fmtFull = (range) => (t) => {
  const d = new Date(t)
  return range === '1D' || range === '1W'
    ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function PerfTooltip({ active, payload, range }) {
  if (!active || !payload?.length) return null
  const { t, v } = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <div className="text-xs text-muted">{fmtFull(range)(t)}</div>
      <div className="font-bold">{money(v)}</div>
    </div>
  )
}

function LastLabel({ viewBox, value }) {
  if (!viewBox) return null
  // ReferenceDot passes the dot's bounding box; use its centre.
  const cx = viewBox.cx ?? viewBox.x + (viewBox.width ?? 0) / 2
  const cy = viewBox.cy ?? viewBox.y + (viewBox.height ?? 0) / 2
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
  const text = money(value)
  const w = text.length * 8.2 + 22
  // Bubble sits above the last point, nudged left so it never leaves the chart.
  const x = Math.max(cx - w + 16, 4)
  return (
    <g>
      <rect x={x} y={cy - 42} width={w} height={26} rx={9} fill="#f1ebff" />
      <text x={x + w / 2} y={cy - 24.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#2b1a7a">
        {text}
      </text>
    </g>
  )
}

export function PerformanceChart({ points, range, height = 280 }) {
  const data = useMemo(() => points.map(([t, v]) => ({ t, v })), [points])
  if (data.length < 2) return null

  const values = data.map((d) => d.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min || max * 0.02 || 1) * 0.15
  const last = data[data.length - 1]

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 38, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c4dff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#7c4dff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={fmtTick(range)}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            minTickGap={44}
            tickMargin={8}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tickFormatter={moneyCompact}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={58}
            tickCount={5}
          />
          <Tooltip content={<PerfTooltip range={range} />} cursor={{ stroke: 'var(--soft)', strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="v"
            stroke="#a07bff"
            strokeWidth={2.5}
            fill="url(#perfFill)"
            dot={false}
            activeDot={{ r: 5, fill: '#fff', stroke: '#7c4dff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <ReferenceDot
            x={last.t}
            y={last.v}
            r={5.5}
            fill="#e9e0ff"
            stroke="#7c4dff"
            strokeWidth={2}
            ifOverflow="visible"
            label={<LastLabel value={last.v} />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AllocationDonut({ allocation, total, size = 220 }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={allocation}
            dataKey="value"
            nameKey="asset_class"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={allocation.length > 1 ? 2 : 0}
            stroke="var(--surface)"
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {allocation.map((a) => (
              <Cell key={a.asset_class} fill={CLASS_COLORS[a.asset_class]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="px-6 text-lg font-extrabold leading-tight sm:text-xl">{moneyWhole(total)}</span>
        <span className="mt-0.5 text-xs text-muted">Total Value</span>
      </div>
    </div>
  )
}

export function Sparkline({ data, up = true, width = 88, height = 30 }) {
  if (!data || data.length < 2) return <span style={{ width }} className="inline-block" />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => [i * step, height - 3 - ((v - min) / span) * (height - 6)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const color = up ? 'var(--gain)' : 'var(--loss)'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// Generic dark-theme tooltip for cash-flow charts
export function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      {label != null && <div className="mb-1 text-xs text-muted">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto font-bold">{money(p.value)}</span>
        </div>
      ))}
    </div>
  )
}
