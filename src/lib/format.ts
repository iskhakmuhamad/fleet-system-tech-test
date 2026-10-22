const STATUS: Record<string, string> = {
  IN_TRANSIT_TO: 'In transit',
  STOPPED_AT: 'Stopped',
  INCOMING_AT: 'Incoming',
}

const OCCUPANCY: Record<string, string> = {
  EMPTY: 'Empty',
  MANY_SEATS_AVAILABLE: 'Many seats',
  FEW_SEATS_AVAILABLE: 'Few seats',
  STANDING_ROOM_ONLY: 'Standing room',
  CRUSHED_STANDING_ROOM_ONLY: 'Crowded',
  FULL: 'Full',
  NOT_ACCEPTING_PASSENGERS: 'Not boarding',
}

export function statusLabel(status: string): string {
  return STATUS[status] ?? titleCase(status)
}

export function occupancyLabel(value: string | null | undefined): string | null {
  if (!value) return null
  return OCCUPANCY[value] ?? titleCase(value)
}

export function relativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const sec = Math.round((now - then) / 1000)
  if (sec < 45) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function absoluteTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function coords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export function kmh(speedMps: number): string {
  return `${(speedMps * 3.6).toFixed(1)} km/h`
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ')
}
