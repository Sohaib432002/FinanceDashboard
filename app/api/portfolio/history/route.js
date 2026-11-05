import { getDb } from '@/lib/db'
import { getChart, RANGES } from '@/lib/market'

export const dynamic = 'force-dynamic'

// Portfolio value over time, built from each holding's real price history and
// the quantities currently held (past buys/sells are not tracked).
export async function GET(request) {
  const key = (request.nextUrl.searchParams.get('range') || '1M').toUpperCase()
  const cfg = RANGES[key]
  if (!cfg) return Response.json({ error: 'Invalid range.' }, { status: 400 })

  const db = await getDb()
  const { rows } = await db.execute('SELECT symbol, asset_class, shares FROM holdings')
  if (!rows.length) {
    return Response.json({ range: key, label: cfg.label, points: [], change: 0, changePct: 0, partial: [] })
  }

  const cash = rows.filter((r) => r.asset_class === 'Cash').reduce((a, r) => a + Number(r.shares), 0)
  const priced = rows.filter((r) => r.asset_class !== 'Cash')

  const settled = await Promise.allSettled(priced.map((r) => getChart(r.symbol, cfg.range, cfg.interval)))
  const partial = []
  const series = []
  settled.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value.points.length) {
      series.push({
        shares: Number(priced[i].shares),
        points: res.value.points,
        prevClose: res.value.prevClose,
      })
    } else {
      partial.push(priced[i].symbol)
    }
  })

  if (!series.length) {
    return Response.json({
      range: key,
      label: cfg.label,
      points: cash ? [[Date.now(), cash]] : [],
      change: 0,
      changePct: 0,
      partial,
    })
  }

  // Union of timestamps; forward-fill each series; start once every series has data.
  const times = [...new Set(series.flatMap((s) => s.points.map((p) => p[0])))].sort((a, b) => a - b)
  const cursors = series.map(() => ({ i: 0, last: null }))
  const points = []
  for (const t of times) {
    let total = cash
    let ready = true
    series.forEach((s, k) => {
      const c = cursors[k]
      while (c.i < s.points.length && s.points[c.i][0] <= t) c.last = s.points[c.i++][1]
      if (c.last == null) ready = false
      else total += c.last * s.shares
    })
    if (ready) points.push([t, Math.round(total * 100) / 100])
  }

  // Today's change is measured from yesterday's close, like a brokerage app.
  let first = points[0]?.[1] ?? 0
  if (key === '1D' && series.every((s) => s.prevClose != null)) {
    first = Math.round((cash + series.reduce((a, s) => a + s.prevClose * s.shares, 0)) * 100) / 100
  }
  const last = points.at(-1)?.[1] ?? 0
  return Response.json({
    range: key,
    label: cfg.label,
    points,
    change: Math.round((last - first) * 100) / 100,
    changePct: first ? Math.round(((last - first) / first) * 10000) / 100 : 0,
    partial,
  })
}
