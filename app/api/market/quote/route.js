import { getChart } from '@/lib/market'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const symbol = (request.nextUrl.searchParams.get('symbol') || '').toUpperCase()
  if (!/^[A-Z0-9.\-^=]{1,15}$/.test(symbol)) return Response.json({ error: 'Invalid symbol.' }, { status: 400 })
  try {
    const q = await getChart(symbol, '1mo', '1d')
    if (q.currency !== 'USD') {
      return Response.json({ error: `${symbol} is quoted in ${q.currency}. Only USD instruments are supported.` }, { status: 422 })
    }
    return Response.json({ symbol: q.symbol, name: q.name, price: q.price, currency: q.currency })
  } catch {
    return Response.json({ error: `Could not load a price for ${symbol}.` }, { status: 502 })
  }
}
