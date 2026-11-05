import { getDb } from '@/lib/db'
import { requireWrite } from '@/lib/auth'
import { badRequest, validateHolding } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const parseId = (raw) => {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

// The symbol is fixed once a holding exists; shares, cost and class can change.
export async function PUT(request, { params }) {
  const denied = requireWrite(request)
  if (denied) return denied

  const id = parseId((await params).id)
  if (!id) return Response.json({ error: 'Invalid id.' }, { status: 400 })

  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT symbol, name FROM holdings WHERE id = ?', args: [id] })
  if (!rows.length) return Response.json({ error: 'Holding not found.' }, { status: 404 })

  const body = await request.json().catch(() => null)
  const { value, errors } = validateHolding({ ...body, symbol: rows[0].symbol, name: rows[0].name })
  if (Object.keys(errors).length) return badRequest(errors)

  await db.execute({
    sql: 'UPDATE holdings SET asset_class = ?, shares = ?, avg_cost = ? WHERE id = ?',
    args: [value.asset_class, value.shares, value.avg_cost, id],
  })
  return Response.json({ id, ...value, symbol: rows[0].symbol, name: rows[0].name })
}

export async function DELETE(request, { params }) {
  const denied = requireWrite(request)
  if (denied) return denied

  const id = parseId((await params).id)
  if (!id) return Response.json({ error: 'Invalid id.' }, { status: 400 })

  const db = await getDb()
  const res = await db.execute({ sql: 'DELETE FROM holdings WHERE id = ?', args: [id] })
  if (res.rowsAffected === 0) return Response.json({ error: 'Holding not found.' }, { status: 404 })
  return Response.json({ ok: true })
}
