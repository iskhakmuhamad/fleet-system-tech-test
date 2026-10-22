import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { SearchState } from '../../lib/searchState.ts'
import { getVehicle, listVehicles } from './api.ts'

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (s: Pick<SearchState, 'page' | 'pageSize' | 'routes' | 'trips'>) =>
    [...vehicleKeys.all, 'list', s.page, s.pageSize, s.routes, s.trips] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
}

export function useVehicleList(s: SearchState) {
  return useQuery({
    queryKey: vehicleKeys.list(s),
    queryFn: ({ signal }) =>
      listVehicles(
        {
          page: s.page,
          pageSize: s.pageSize,
          routes: s.routes,
          trips: s.trips,
        },
        signal,
      ),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  })
}

export function useVehicleDetail(id: string | null) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getVehicle(id!, signal),
    enabled: Boolean(id),
  })
}
