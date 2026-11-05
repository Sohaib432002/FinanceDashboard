import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="card mx-auto mt-10 max-w-lg p-10 text-center">
      <p className="text-5xl font-extrabold text-soft">404</p>
      <h1 className="mt-3 text-xl font-bold">Page not found</h1>
      <p className="mt-1.5 text-sm text-muted">This page does not exist.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to portfolio
      </Link>
    </div>
  )
}
