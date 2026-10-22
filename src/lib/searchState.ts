import { useCallback, useEffect, useState } from 'react'

export const PAGE_SIZES = [5, 10, 20, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export type SearchState = {
  page: number
  pageSize: PageSize
  routes: string[]
  trips: string[]
  vehicleId: string | null
}

export const defaultSearch: SearchState = {
  page: 1,
  pageSize: 10,
  routes: [],
  trips: [],
  vehicleId: null,
}

function splitIds(raw: string | null): string[] {
  if (!raw) return []
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))].sort()
}

function isPageSize(n: number): n is PageSize {
  return (PAGE_SIZES as readonly number[]).includes(n)
}

export function parseSearch(search: string): SearchState {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const pageRaw = Number(q.get('page') ?? 1)
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
  const sizeRaw = Number(q.get('pageSize') ?? defaultSearch.pageSize)
  const pageSize = isPageSize(sizeRaw) ? sizeRaw : defaultSearch.pageSize
  const vehicle = q.get('vehicle')
  return {
    page,
    pageSize,
    routes: splitIds(q.get('routes')),
    trips: splitIds(q.get('trips')),
    vehicleId: vehicle && vehicle.trim() ? vehicle.trim() : null,
  }
}

export function toSearch(state: SearchState): string {
  const q = new URLSearchParams()
  if (state.page !== defaultSearch.page) q.set('page', String(state.page))
  if (state.pageSize !== defaultSearch.pageSize) q.set('pageSize', String(state.pageSize))
  if (state.routes.length) q.set('routes', [...state.routes].sort().join(','))
  if (state.trips.length) q.set('trips', [...state.trips].sort().join(','))
  if (state.vehicleId) q.set('vehicle', state.vehicleId)
  return q.toString()
}

function writeUrl(state: SearchState, mode: 'push' | 'replace') {
  const qs = toSearch(state)
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
  if (mode === 'push') window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
}

export function useSearchState() {
  const [state, setState] = useState<SearchState>(() => parseSearch(window.location.search))

  useEffect(() => {
    const sync = () => setState(parseSearch(window.location.search))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const patch = useCallback((partial: Partial<SearchState>, mode: 'push' | 'replace' = 'replace') => {
    setState((prev) => {
      const next = { ...prev, ...partial }
      writeUrl(next, mode)
      return next
    })
  }, [])

  return { state, patch }
}
