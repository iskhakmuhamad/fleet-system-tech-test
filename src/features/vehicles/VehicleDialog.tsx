import { lazy, Suspense, useEffect, useRef } from 'react'
import {
  absoluteTime,
  coords,
  kmh,
  occupancyLabel,
  relativeTime,
  statusLabel,
} from '../../lib/format.ts'
import { LoadError } from '../../shared/QueryState.tsx'
import { useVehicleDetail } from './queries.ts'

const VehicleMap = lazy(() => import('./VehicleMap.tsx'))

type Props = {
  id: string
  onClose: () => void
}

export function VehicleDialog({ id, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const query = useVehicleDetail(id)
  const v = query.data

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const restore = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const items = [...nodes].filter((el) => !el.hasAttribute('disabled'))
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      restore?.focus()
    }
  }, [onClose])

  const direction =
    v && v.directionId != null ? v.route?.directionNames[v.directionId] : undefined

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-dialog-title"
        className="dialog-panel"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Vehicle detail</p>
            <h2 id="vehicle-dialog-title" className="text-xl font-semibold text-ink">
              {v?.label ?? id}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-stone-100"
          >
            Close
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          {query.isPending && <p className="text-sm text-muted">Loading vehicle…</p>}
          {query.isError && <LoadError error={query.error} onRetry={() => void query.refetch()} />}
          {v && (
            <>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Field label="Status" title={v.status} value={statusLabel(v.status)} />
                <Field
                  label="Last update"
                  title={absoluteTime(v.updatedAt)}
                  value={relativeTime(v.updatedAt)}
                />
                <Field
                  label="Coordinates"
                  value={v.lat != null && v.lng != null ? coords(v.lat, v.lng) : '—'}
                />
                <Field label="Occupancy" value={occupancyLabel(v.occupancy) ?? '—'} />
                <Field label="Route" value={routeText(v.route)} />
                <Field label="Trip" value={tripText(v.trip)} />
                <Field label="Stop" value={v.stop?.name || v.stop?.id || '—'} />
                <Field label="Direction" value={direction || '—'} />
                <Field label="Speed" value={v.speed != null ? kmh(v.speed) : '—'} />
                <Field label="Bearing" value={v.bearing != null ? `${Math.round(v.bearing)}°` : '—'} />
              </dl>
              <Suspense fallback={<p className="text-sm text-muted">Loading map…</p>}>
                <VehicleMap vehicle={v} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-ink" title={title}>
        {value}
      </dd>
    </div>
  )
}

function routeText(route: { shortName: string; longName: string; id: string } | null): string {
  if (!route) return '—'
  if (route.shortName && route.longName) return `${route.shortName} · ${route.longName}`
  return route.longName || route.shortName || route.id
}

function tripText(trip: { id: string; headsign: string; name: string } | null): string {
  if (!trip) return '—'
  const label = trip.headsign || trip.name
  return label ? `${label} (${trip.id})` : trip.id
}
