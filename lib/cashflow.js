import { monthName } from './format'

export function totals(tx) {
  let income = 0
  let expense = 0
  for (const t of tx) {
    if (t.type === 'income') income += Number(t.amount)
    else expense += Number(t.amount)
  }
  return { income, expense, balance: income - expense, count: tx.length }
}

export const yearsOf = (tx) => [...new Set(tx.map((t) => t.date.slice(0, 4)))].sort().reverse()

// One entry per calendar month between the first and last transaction (gaps filled with 0).
export function monthly(tx) {
  if (!tx.length) return []
  const map = new Map()
  let min = '9999-99'
  let max = '0000-00'
  for (const t of tx) {
    const key = t.date.slice(0, 7)
    if (key < min) min = key
    if (key > max) max = key
    const m = map.get(key) || { income: 0, expense: 0 }
    m[t.type] += Number(t.amount)
    map.set(key, m)
  }
  const out = []
  let [y, mo] = min.split('-').map(Number)
  const [ey, emo] = max.split('-').map(Number)
  while (y < ey || (y === ey && mo <= emo)) {
    const key = `${y}-${String(mo).padStart(2, '0')}`
    const m = map.get(key) || { income: 0, expense: 0 }
    out.push({
      key,
      label: `${monthName(mo - 1)} ${String(y).slice(2)}`,
      income: m.income,
      expense: m.expense,
      net: m.income - m.expense,
    })
    mo += 1
    if (mo > 12) {
      mo = 1
      y += 1
    }
  }
  return out
}

// Sum by category for one type, largest first.
export function byCategory(tx, type) {
  const map = {}
  for (const t of tx) if (t.type === type) map[t.category] = (map[t.category] || 0) + Number(t.amount)
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function toCsv(tx) {
  const esc = (v) => `"${String(v).replaceAll('"', '""')}"`
  const rows = [['Date', 'Type', 'Category', 'Amount'], ...tx.map((t) => [t.date, t.type, t.category, t.amount])]
  return rows.map((r) => r.map(esc).join(',')).join('\n')
}
