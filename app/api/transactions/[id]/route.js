import { getDb } from '@/lib/db'
import { requireWrite } from '@/lib/auth'
import { badRequest, validateTransaction } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const parseId = (raw) => {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PUT(request, { params }) {
  const denied = requireWrite(request)
  if (denied) return denied

  const id = parseId((await params).id)
  if (!id) return Response.json({ error: 'Invalid id.' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const { value, errors } = validateTransaction(body)
  if (Object.keys(errors).length) return badRequest(errors)

  const db = await getDb()
  const res = await db.execute({
    sql: 'UPDATE transactions SET date = ?, amount = ?, category = ?, type = ? WHERE id = ?',
    args: [value.date, value.amount, value.category, value.type, id],
  })
  if (res.rowsAffected === 0) return Response.json({ error: 'Transaction not found.' }, { status: 404 })
  return Response.json({ id, ...value })
}

export async function DELETE(request, { params }) {
  const denied = requireWrite(request)
  if (denied) return denied

  const id = parseId((await params).id)
  if (!id) return Response.json({ error: 'Invalid id.' }, { status: 400 })

  const db = await getDb()
  const res = await db.execute({ sql: 'DELETE FROM transactions WHERE id = ?', args: [id] })
  if (res.rowsAffected === 0) return Response.json({ error: 'Transaction not found.' }, { status: 404 })
  return Response.json({ ok: true })
}
