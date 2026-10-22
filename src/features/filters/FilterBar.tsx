import { InfiniteMultiSelect } from './InfiniteMultiSelect.tsx'
import { useRoutePages, useTripPages } from './queries.ts'

type Props = {
  routes: string[]
  trips: string[]
  onRoutes: (ids: string[]) => void
  onTrips: (ids: string[]) => void
}

export function FilterBar({ routes, trips, onRoutes, onTrips }: Props) {
  const routeQuery = useRoutePages()
  const tripQuery = useTripPages(routes)

  const routeOptions = routeQuery.data?.pages.flatMap((p) => p.items) ?? []
  const tripOptions = tripQuery.data?.pages.flatMap((p) => p.items) ?? []
  const hasFilters = routes.length > 0 || trips.length > 0

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4 sm:flex-row sm:items-start">
      <InfiniteMultiSelect
        label="Route"
        values={routes}
        onChange={onRoutes}
        options={routeOptions}
        hasMore={Boolean(routeQuery.hasNextPage)}
        loadMore={() => void routeQuery.fetchNextPage()}
        loading={routeQuery.isFetching}
        error={routeQuery.error}
        onRetry={() => void routeQuery.refetch()}
      />
      <InfiniteMultiSelect
        label="Trip"
        values={trips}
        onChange={onTrips}
        options={tripOptions}
        hasMore={Boolean(tripQuery.hasNextPage)}
        loadMore={() => void tripQuery.fetchNextPage()}
        loading={tripQuery.isFetching}
        error={tripQuery.error}
        onRetry={() => void tripQuery.refetch()}
        hint={
          routes.length === 0
            ? 'Select a route to narrow this list. Unscoped trips are a large set.'
            : undefined
        }
      />
      {hasFilters && (
        <button
          type="button"
          className="self-end text-sm text-tj hover:underline sm:mb-0 sm:mt-6"
          onClick={() => {
            onRoutes([])
            onTrips([])
          }}
        >
          Clear filters
        </button>
      )}
    </section>
  )
}
