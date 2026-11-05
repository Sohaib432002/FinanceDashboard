export const ASSET_CLASSES = ['Stocks', 'ETFs', 'Mutual Funds', 'Bonds', 'Cash']

const str = (v) => (typeof v === 'string' ? v.trim() : '')

export function validateTransaction(body) {
  const category = str(body?.category)
  const type = str(body?.type)
  const date = str(body?.date)
  const amount = Number(body?.amount)
  const errors = {}

  if (!category || category.length > 60) errors.category = 'Category is required (max 60 characters).'
  if (!['income', 'expense'].includes(type)) errors.type = 'Type must be income or expense.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.date = 'Enter a valid date.'
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1e12) errors.amount = 'Amount must be greater than 0.'

  return { value: { category, type, date, amount }, errors }
}

export function validateHolding(body) {
  const asset_class = str(body?.asset_class)
  const isCash = asset_class === 'Cash'
  const symbol = isCash ? 'CASH' : str(body?.symbol).toUpperCase()
  const name = isCash ? 'Cash' : str(body?.name) || symbol
  const shares = Number(body?.shares)
  const avg_cost = isCash ? 1 : Number(body?.avg_cost)
  const errors = {}

  if (!ASSET_CLASSES.includes(asset_class)) errors.asset_class = 'Choose an asset class.'
  if (!isCash && !/^[A-Z0-9.\-^=]{1,15}$/.test(symbol)) errors.symbol = 'Enter a valid ticker symbol.'
  if (!Number.isFinite(shares) || shares <= 0 || shares > 1e12)
    errors.shares = isCash ? 'Enter a cash amount greater than 0.' : 'Shares must be greater than 0.'
  if (!Number.isFinite(avg_cost) || avg_cost < 0 || avg_cost > 1e9) errors.avg_cost = 'Enter your average cost per share.'

  return { value: { symbol, name: name.slice(0, 120), asset_class, shares, avg_cost }, errors }
}

export const badRequest = (errors) =>
  Response.json({ error: Object.values(errors)[0], errors }, { status: 400 })
