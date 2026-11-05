// Live market data from Yahoo Finance's public chart/search endpoints (free, no key).
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const cache = (globalThis.__marketCache ||= new Map())

async function cached(key, ttlMs, load) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value
  const value = await load()
  cache.set(key, { at: Date.now(), value })
  if (cache.size > 500) cache.delete(cache.keys().next().value)
  return value
}

async function yahoo(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(9000),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Market data request failed (${res.status})`)
  return res.json()
}

// range/interval pairs for the dashboard's time tabs
export const RANGES = {
  '1D': { range: '1d', interval: '5m', label: 'today' },
  '1W': { range: '5d', interval: '30m', label: 'this week' },
  '1M': { range: '1mo', interval: '1d', label: 'this month' },
  '3M': { range: '3mo', interval: '1d', label: 'in 3 months' },
  '1Y': { range: '1y', interval: '1d', label: 'this year' },
  ALL: { range: 'max', interval: '1wk', label: 'all time' },
}

export async function getChart(symbol, range = '1mo', interval = '1d') {
  const ttl = ['5m', '30m', '1h'].includes(interval) ? 60_000 : 300_000
  return cached(`chart:${symbol}:${range}:${interval}`, ttl, async () => {
    const data = await yahoo(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
    )
    const result = data?.chart?.result?.[0]
    if (!result) throw new Error(data?.chart?.error?.description || `No market data for ${symbol}`)

    const meta = result.meta || {}
    const closes = result.indicators?.quote?.[0]?.close || []
    const points = (result.timestamp || [])
      .map((t, i) => [t * 1000, closes[i]])
      .filter((p) => p[1] != null && Number.isFinite(p[1]))

    let dayChangePct = meta.regularMarketChangePercent
    if (!Number.isFinite(dayChangePct) && points.length > 1 && interval === '1d') {
      const prev = points[points.length - 2][1]
      dayChangePct = prev ? ((points[points.length - 1][1] - prev) / prev) * 100 : 0
    }

    return {
      symbol: meta.symbol || symbol,
      name: meta.longName || meta.shortName || symbol,
      price: meta.regularMarketPrice ?? points.at(-1)?.[1] ?? null,
      dayChangePct: Number.isFinite(dayChangePct) ? dayChangePct : null,
      prevClose: meta.chartPreviousClose ?? null,
      currency: meta.currency || 'USD',
      instrumentType: meta.instrumentType || '',
      points,
    }
  })
}

const CLASS_BY_TYPE = { EQUITY: 'Stocks', ETF: 'ETFs', MUTUALFUND: 'Mutual Funds' }
export const assetClassFor = (type) => CLASS_BY_TYPE[type] || 'Stocks'

export async function searchSymbols(query) {
  const q = query.trim().slice(0, 40)
  if (!q) return []
  return cached(`search:${q.toLowerCase()}`, 600_000, async () => {
    const data = await yahoo(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`
    )
    return (data.quotes || [])
      .filter((r) => CLASS_BY_TYPE[r.quoteType])
      .map((r) => ({
        symbol: r.symbol,
        name: r.longname || r.shortname || r.symbol,
        exchange: r.exchDisp || r.exchange || '',
        asset_class: CLASS_BY_TYPE[r.quoteType],
      }))
  })
}
