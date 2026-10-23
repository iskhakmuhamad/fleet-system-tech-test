import { useCallback } from 'react'
import { FilterBar } from './features/filters/FilterBar.tsx'
import { PaginationBar } from './features/pagination/PaginationBar.tsx'
import { VehicleDialog } from './features/vehicles/VehicleDialog.tsx'
import { VehicleGrid } from './features/vehicles/VehicleGrid.tsx'
import { useVehicleList } from './features/vehicles/queries.ts'
import { useSearchState, type PageSize } from './lib/searchState.ts'
import { CardSkeleton, EmptyState, LoadError } from './shared/QueryState.tsx'

export default function App() {
  const { state, patch } = useSearchState()
  const list = useVehicleList(state)

  const setRoutes = useCallback(
    (routes: string[]) => patch({ routes, page: 1 }),
    [patch],
  )
  const setTrips = useCallback(
    (trips: string[]) => patch({ trips, page: 1 }),
    [patch],
  )
  const openVehicle = useCallback(
    (vehicleId: string) => {
      patch({ vehicleId }, 'push')
    },
    [patch],
  )
  const closeVehicle = useCallback(() => {
    patch({ vehicleId: null })
  }, [patch])

  const hasFilters = state.routes.length > 0 || state.trips.length > 0
  const items = list.data?.items ?? []
  const showSkeleton = list.isPending && !list.data
  const stale = list.isFetching && Boolean(list.data)

  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-white">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/tj-icon.png"
              alt="Transjakarta"
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Boscotan Fleet Board</h1>
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted sm:text-sm">
            <span
              className={`h-2 w-2 rounded-full ${list.isFetching ? 'bg-amber-500' : 'bg-emerald-600'}`}
              aria-hidden
            />
            {list.isFetching ? 'Updating' : 'Live'}
          </p>
        </div>
      </header>

      <main className="flex w-full flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-muted">
          Live vehicle positions from the MBTA v3 API. Filters and page live in the URL.
        </p>

        <FilterBar
          routes={state.routes}
          trips={state.trips}
          onRoutes={setRoutes}
          onTrips={setTrips}
        />

        {showSkeleton && <CardSkeleton />}
        {list.isError && !list.data && (
          <LoadError error={list.error} onRetry={() => void list.refetch()} />
        )}
        {list.data && items.length === 0 && (
          <EmptyState
            title={hasFilters ? 'No vehicles match these filters' : 'No vehicles reported'}
            body={
              hasFilters
                ? 'Clear a route or trip, or wait for the next poll.'
                : 'MBTA did not return any vehicles right now.'
            }
          />
        )}
        {items.length > 0 && (
          <VehicleGrid items={items} stale={stale} onOpen={openVehicle} />
        )}
        {list.data && (
          <PaginationBar
            page={state.page}
            pageSize={state.pageSize}
            from={list.data.from}
            to={list.data.to}
            totalItems={list.data.totalItems}
            totalPages={list.data.totalPages}
            onPage={(page) => patch({ page })}
            onPageSize={(pageSize: PageSize) => patch({ pageSize, page: 1 })}
          />
        )}
      </main>

      {state.vehicleId && <VehicleDialog id={state.vehicleId} onClose={closeVehicle} />}
    </div>
  )
}
