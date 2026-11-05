const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const money = (n) => usd.format(Number(n) || 0)
export const moneyWhole = (n) => usdWhole.format(Number(n) || 0)
export const moneyCompact = (n) => usdCompact.format(Number(n) || 0)
export const signedMoney = (n) => `${n >= 0 ? '+' : '-'}${usd.format(Math.abs(Number(n) || 0))}`
export const signedPct = (n) => `${n >= 0 ? '+' : '-'}${Math.abs(Number(n) || 0).toFixed(2)}%`
export const qty = (n) =>
  Number(n).toLocaleString('en-US', { maximumFractionDigits: 6 })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const monthName = (i) => MONTHS[i]

// "2026-03-04" -> "4 Mar 2026" without timezone drift
export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
