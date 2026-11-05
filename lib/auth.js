import crypto from 'node:crypto'

// Optional write protection. When ADMIN_TOKEN is set, every create / update /
// delete request must send it in the `x-admin-token` header.
export const writeProtected = () => Boolean(process.env.ADMIN_TOKEN)

export function tokenOk(request) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) return true
  const given = Buffer.from(request.headers.get('x-admin-token') || '')
  const want = Buffer.from(expected)
  return given.length === want.length && crypto.timingSafeEqual(given, want)
}

export function requireWrite(request) {
  if (tokenOk(request)) return null
  return Response.json({ error: 'Admin token required.' }, { status: 401 })
}
