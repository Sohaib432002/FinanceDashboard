import { useId } from 'react'

// Small inline icon set (no external icon font needed).
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const make = (children) =>
  function Icon({ size = 20, ...props }) {
    return (
      <svg {...base} width={size} height={size} {...props}>
        {children}
      </svg>
    )
  }

export const PieIcon = make(
  <>
    <path d="M21 12A9 9 0 1 1 12 3v9z" />
    <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
  </>
)
export const LayersIcon = make(
  <>
    <path d="m12 3 9 5-9 5-9-5z" />
    <path d="m3 13 9 5 9-5" />
  </>
)
export const FlowIcon = make(
  <>
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </>
)
export const ListIcon = make(
  <>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </>
)
export const BulbIcon = make(
  <>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </>
)
export const FileIcon = make(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </>
)
export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
)
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />)
export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />)
export const EditIcon = make(
  <>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </>
)
export const TrashIcon = make(
  <>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
  </>
)
export const SunIcon = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
)
export const MoonIcon = make(<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />)
export const ChevronRight = make(<path d="m9 6 6 6-6 6" />)
export const DownloadIcon = make(
  <>
    <path d="M12 4v11M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </>
)
export const ShieldIcon = make(
  <>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
)

export function Logo({ size = 40 }) {
  // unique id: duplicate gradient ids break when the first copy is display:none
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9a5f2" />
          <stop offset="1" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
      <path d="M24 44C24 28 14 22 5 8c11 0 19 4 19 18z" fill={`url(#${id})`} />
      <path d="M24 44c0-16 10-22 19-36-11 0-19 4-19 18z" fill={`url(#${id})`} opacity=".75" />
    </svg>
  )
}
