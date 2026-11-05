import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'
import seedTransactions from './seed-transactions.json'

// SQLite via libSQL: a local file by default, or a free hosted Turso database
// when TURSO_DATABASE_URL is set (needed on serverless hosts such as Vercel).
//  - TURSO_DATABASE_URL set  -> permanent hosted database
//  - running on Vercel without it -> temporary file in /tmp (read-only disk elsewhere): works, but resets
//  - otherwise (local dev)   -> data/finance.db
export const storageMode = process.env.TURSO_DATABASE_URL ? 'database' : process.env.VERCEL ? 'temporary' : 'local'
const url =
  process.env.TURSO_DATABASE_URL ||
  (storageMode === 'temporary' ? 'file:/tmp/finance.db' : 'file:data/finance.db')

if (url.startsWith('file:')) {
  fs.mkdirSync(path.dirname(path.resolve(url.slice('file:'.length))), { recursive: true })
}

const globalForDb = globalThis
const client =
  globalForDb.__financeDb ||
  (globalForDb.__financeDb = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }))

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS transactions (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     date       TEXT    NOT NULL,
     amount     REAL    NOT NULL CHECK (amount > 0),
     category   TEXT    NOT NULL,
     type       TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
     created_at TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`,
  `CREATE TABLE IF NOT EXISTS holdings (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     symbol      TEXT    NOT NULL UNIQUE,
     name        TEXT    NOT NULL,
     asset_class TEXT    NOT NULL CHECK (asset_class IN ('Stocks', 'ETFs', 'Mutual Funds', 'Bonds', 'Cash')),
     shares      REAL    NOT NULL CHECK (shares > 0),
     avg_cost    REAL    NOT NULL CHECK (avg_cost >= 0),
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
]

let ready
async function init() {
  await client.batch(SCHEMA, 'write')
  const { rows } = await client.execute('SELECT COUNT(*) AS n FROM transactions')
  if (Number(rows[0].n) === 0) {
    // First run: load the original sample transactions that shipped with the app.
    await client.batch(
      seedTransactions.map((t) => ({
        sql: 'INSERT INTO transactions (date, amount, category, type) VALUES (?, ?, ?, ?)',
        args: [t.date, t.amount, t.category, t.type],
      })),
      'write'
    )
  }
}

export async function getDb() {
  ready ||= init().catch((err) => {
    ready = undefined
    throw err
  })
  await ready
  return client
}
