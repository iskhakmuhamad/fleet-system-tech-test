import { useInfiniteQuery } from '@tanstack/react-query'
import { listRoutes, listTrips } from './api.ts'

export function useRoutePages() {
  return useInfiniteQuery({
    queryKey: ['routes'],
    queryFn: ({ pageParam, signal }) => listRoutes(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    staleTime: 5 * 60_000,
  })
}

export function useTripPages(routeIds: string[]) {
  return useInfiniteQuery({
    queryKey: ['trips', routeIds],
    queryFn: ({ pageParam, signal }) => listTrips(pageParam, routeIds, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    staleTime: 60_000,
  })
}
