import { searchSymbols } from '@/lib/market'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const q = request.nextUrl.searchParams.get('q') || ''
  try {
    return Response.json(await searchSymbols(q))
  } catch {
    return Response.json({ error: 'Market search is unavailable right now.' }, { status: 502 })
  }
}
