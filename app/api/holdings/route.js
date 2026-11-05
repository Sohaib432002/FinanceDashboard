import { getDb } from '@/lib/db'
import { requireWrite } from '@/lib/auth'
import { getChart } from '@/lib/market'
import { badRequest, validateHolding } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const round = (n, d = 2) => (Number.isFinite(n) ? Number(n.toFixed(d)) : null)

// Holdings stored in the database, priced with live market data.
export async function GET() {
  const db = await getDb()
  const { rows } = await db.execute('SELECT * FROM holdings ORDER BY id')

  const holdings = await Promise.all(
    rows.map(async (row) => {
      const h = { ...row, shares: Number(row.shares), avg_cost: Number(row.avg_cost) }
      const cost = h.shares * h.avg_cost
      let price = null
      let dayChangePct = null
      let spark = []
      let priceStatus = 'live'

      if (h.asset_class === 'Cash') {
        price = 1
        dayChangePct = 0
      } else {
        try {
          const q = await getChart(h.symbol, '1mo', '1d')
          price = q.price
          dayChangePct = q.dayChangePct
          spark = q.points.slice(-30).map((p) => round(p[1], 4))
        } catch {
          priceStatus = 'unavailable'
        }
      }
      // If a price can't be fetched, fall back to cost so totals stay meaningful, and flag it.
      const effective = price ?? h.avg_cost
      const value = h.shares * effective
      return {
        id: h.id,
        symbol: h.symbol,
        name: h.name,
        asset_class: h.asset_class,
        shares: h.shares,
        avg_cost: h.avg_cost,
        price: round(effective, 4),
        priceStatus,
        dayChangePct: round(dayChangePct),
        spark,
        value: round(value),
        cost: round(cost),
        gain: round(value - cost),
        gainPct: cost > 0 ? round(((value - cost) / cost) * 100) : 0,
      }
    })
  )

  const value = holdings.reduce((a, h) => a + h.value, 0)
  const invested = holdings.reduce((a, h) => a + h.cost, 0)
  const byClass = {}
  holdings.forEach((h) => (byClass[h.asset_class] = (byClass[h.asset_class] || 0) + h.value))
  const order = ['Stocks', 'ETFs', 'Mutual Funds', 'Bonds', 'Cash']
  const allocation = order
    .filter((c) => byClass[c])
    .map((c) => ({ asset_class: c, value: round(byClass[c]), pct: value ? round((byClass[c] / value) * 100, 1) : 0 }))

  return Response.json({
    holdings,
    totals: {
      value: round(value),
      invested: round(invested),
      gain: round(value - invested),
      gainPct: invested > 0 ? round(((value - invested) / invested) * 100) : 0,
    },
    allocation,
    unavailable: holdings.filter((h) => h.priceStatus === 'unavailable').map((h) => h.symbol),
    asOf: new Date().toISOString(),
  })
}

export async function POST(request) {
  const denied = requireWrite(request)
  if (denied) return denied

  const body = await request.json().catch(() => null)
  const { value, errors } = validateHolding(body)
  if (Object.keys(errors).length) return badRequest(errors)

  if (value.asset_class !== 'Cash') {
    try {
      const q = await getChart(value.symbol, '1mo', '1d')
      if (q.currency !== 'USD') {
        return Response.json(
          { error: `${value.symbol} is quoted in ${q.currency}. Only USD instruments are supported.` },
          { status: 422 }
        )
      }
      if (!body?.name) value.name = q.name.slice(0, 120)
    } catch {
      return Response.json({ error: `Could not find market data for ${value.symbol}.` }, { status: 422 })
    }
  }

  const db = await getDb()
  try {
    const res = await db.execute({
      sql: 'INSERT INTO holdings (symbol, name, asset_class, shares, avg_cost) VALUES (?, ?, ?, ?, ?)',
      args: [value.symbol, value.name, value.asset_class, value.shares, value.avg_cost],
    })
    return Response.json({ id: Number(res.lastInsertRowid), ...value }, { status: 201 })
  } catch (err) {
    if (String(err?.message).includes('UNIQUE')) {
      return Response.json(
        { error: `${value.symbol} is already in your portfolio. Edit it instead.` },
        { status: 409 }
      )
    }
    throw err
  }
}
