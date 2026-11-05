import { tokenOk, writeProtected } from '@/lib/auth'
import { storageMode } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Tells the UI whether writes need a token, and whether the supplied one is valid.
export async function GET(request) {
  return Response.json({
    protected: writeProtected(),
    valid: tokenOk(request),
    storage: storageMode,
  })
}
