import { absoluteTime, coords, relativeTime, statusLabel } from '../../lib/format.ts'
import type { Vehicle } from '../../types/mbta.ts'

type Props = {
  vehicle: Vehicle
  onOpen: (id: string) => void
}

function badgeInk(hex: string): string {
  const raw = hex.replace('#', '')
  if (raw.length < 6) return '#1c1917'
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.55 ? '#1c1917' : '#fff'
}

function statusDot(status: string): string {
  if (status === 'STOPPED_AT') return 'bg-amber-500'
  if (status === 'INCOMING_AT') return 'bg-sky-500'
  return 'bg-emerald-600'
}

export function VehicleCard({ vehicle, onOpen }: Props) {
  const color = vehicle.route?.color ? `#${vehicle.route.color}` : '#8a847c'
  const routeName = vehicle.route?.shortName || vehicle.route?.longName || '—'

  return (
    <button
      type="button"
      onClick={() => onOpen(vehicle.id)}
      className="w-full cursor-pointer rounded border border-line bg-card px-3 py-3 text-left hover:bg-stone-50"
    >
      <div className="flex items-center gap-2">
        <span
          title={vehicle.route?.longName || routeName}
          className="max-w-[7.5rem] shrink-0 truncate rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none"
          style={{ background: color, color: badgeInk(color) }}
        >
          {routeName}
        </span>
        <span className="min-w-0 truncate text-base font-semibold text-ink">{vehicle.label}</span>
        <span
          title={vehicle.status}
          className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot(vehicle.status)}`} aria-hidden />
          {statusLabel(vehicle.status)}
        </span>
      </div>

      {vehicle.trip?.headsign && (
        <p className="mt-2 truncate text-sm text-muted">to {vehicle.trip.headsign}</p>
      )}

      <p className="mt-2 text-xs text-muted">
        <span className="font-mono">
          {vehicle.lat != null && vehicle.lng != null ? coords(vehicle.lat, vehicle.lng) : 'No coordinates'}
        </span>
        <span aria-hidden> · </span>
        <span title={absoluteTime(vehicle.updatedAt)}>{relativeTime(vehicle.updatedAt)}</span>
      </p>
    </button>
  )
}
