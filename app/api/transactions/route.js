import { getDb } from '@/lib/db'
import { requireWrite } from '@/lib/auth'
import { badRequest, validateTransaction } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await getDb()
  const { rows } = await db.execute(
    'SELECT id, date, amount, category, type FROM transactions ORDER BY date DESC, id DESC'
  )
  return Response.json(rows.map((r) => ({ ...r })))
}

export async function POST(request) {
  const denied = requireWrite(request)
  if (denied) return denied

  const body = await request.json().catch(() => null)
  const { value, errors } = validateTransaction(body)
  if (Object.keys(errors).length) return badRequest(errors)

  const db = await getDb()
  const res = await db.execute({
    sql: 'INSERT INTO transactions (date, amount, category, type) VALUES (?, ?, ?, ?)',
    args: [value.date, value.amount, value.category, value.type],
  })
  return Response.json({ id: Number(res.lastInsertRowid), ...value }, { status: 201 })
}
