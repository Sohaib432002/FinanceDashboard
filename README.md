# Wealthly - Portfolio & Finance Dashboard

Next.js 16 (App Router) + React 19 + Tailwind 4 + Recharts, backed by a free SQLite database.

- **Portfolio** - add the stocks, ETFs, funds and cash you own; live prices, performance chart (1D to ALL), allocation donut, top holdings.
- **Holdings** - full list with add / edit / delete.
- **Cash Flow, Transactions, Insights, Reports** - income and expense tracking with full add / edit / delete, filters, charts and CSV export.
- Light and dark theme, responsive from phone to desktop (sidebar on desktop, bottom tab bar on mobile).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Next prints (http://localhost:3000, or the next free port). The database is created automatically on first run.

## Database

SQLite through [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts) - nothing to install. By default it uses the file `data/finance.db` (git-ignored).

| Table          | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `transactions` | Income / expense records (date, amount, category, type)                 |
| `holdings`     | Your investments (symbol, name, asset class, shares, average cost)      |

On the very first run the 100 original sample transactions (`lib/seed-transactions.json`) are loaded. The portfolio starts empty: add your own holdings in the app.

Schema and connection: `lib/db.js`.

## Market data

Prices, history and symbol search come from Yahoo Finance's free public endpoints (no API key): `lib/market.js`. Responses are cached for 1 to 5 minutes. Only USD-quoted instruments are supported. Portfolio history is calculated from the quantities you hold now (past buys and sells are not tracked).

## API

| Method | Route                              | Description                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/api/transactions`                | List transactions                                  |
| POST   | `/api/transactions`                | Create                                             |
| PUT    | `/api/transactions/:id`            | Update                                             |
| DELETE | `/api/transactions/:id`            | Delete                                             |
| GET    | `/api/holdings`                    | Holdings with live prices, totals and allocation   |
| POST   | `/api/holdings`                    | Add a holding (validated against market data)      |
| PUT    | `/api/holdings/:id`                | Update shares / cost / class                       |
| DELETE | `/api/holdings/:id`                | Remove                                             |
| GET    | `/api/portfolio/history?range=1M`  | Portfolio value series (`1D 1W 1M 3M 1Y ALL`)      |
| GET    | `/api/market/search?q=`            | Symbol search                                      |
| GET    | `/api/market/quote?symbol=`        | Current price                                      |
| GET    | `/api/session`                     | Whether writes are token-protected                 |

## Configuration (optional)

Copy `.env.example` to `.env.local`.

- `ADMIN_TOKEN` - when set, every create / update / delete needs this token. In the app, switch from **Viewer** to **Admin** and enter it. Reading stays public. Without it, the app is open to anyone who can reach it, which is fine locally.
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` - use a free hosted [Turso](https://turso.tech) database instead of the local file.

## Deploying to Vercel

Vercel's filesystem is read-only, so use Turso there:

1. Create a free Turso database and token.
2. In the Vercel project set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` and `ADMIN_TOKEN`.
3. Deploy. Tables are created on first request.

## Scripts

`npm run dev` | `npm run build` | `npm start` | `npm run lint`
