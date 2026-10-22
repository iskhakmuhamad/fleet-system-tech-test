import { indexIncluded, pickIncluded, relId } from '../../lib/jsonApi.ts'
import { mbtaGet } from '../../lib/mbtaClient.ts'
import { paginationFromLinks, type PageInfo } from '../../lib/pagination.ts'
import type {
  JsonApiList,
  JsonApiOne,
  Resource,
  RouteAttrs,
  StopAttrs,
  TripAttrs,
  Vehicle,
  VehicleAttrs,
  VehicleRels,
} from '../../types/mbta.ts'

const INCLUDE = 'route,trip,stop'

export function mapVehicle(
  res: Resource<VehicleAttrs, VehicleRels>,
  included: Map<string, Resource<unknown>>,
): Vehicle {
  const routeRes = pickIncluded<RouteAttrs>(included, 'route', relId(res.relationships?.route))
  const tripRes = pickIncluded<TripAttrs>(included, 'trip', relId(res.relationships?.trip))
  const stopRes = pickIncluded<StopAttrs>(included, 'stop', relId(res.relationships?.stop))
  const a = res.attributes

  return {
    id: res.id,
    label: a.label?.trim() || res.id,
    status: a.current_status,
    lat: a.latitude,
    lng: a.longitude,
    updatedAt: a.updated_at,
    occupancy: a.occupancy_status,
    bearing: a.bearing,
    speed: a.speed,
    directionId: a.direction_id,
    route: routeRes
      ? {
          id: routeRes.id,
          shortName: routeRes.attributes.short_name,
          longName: routeRes.attributes.long_name,
          color: routeRes.attributes.color || 'DA291C',
          directionNames: routeRes.attributes.direction_names ?? [],
        }
      : relId(res.relationships?.route)
        ? {
            id: relId(res.relationships?.route)!,
            shortName: relId(res.relationships?.route)!,
            longName: '',
            color: 'DA291C',
            directionNames: [],
          }
        : null,
    trip: tripRes
      ? {
          id: tripRes.id,
          headsign: tripRes.attributes.headsign || '',
          name: tripRes.attributes.name || '',
        }
      : relId(res.relationships?.trip)
        ? { id: relId(res.relationships?.trip)!, headsign: '', name: '' }
        : null,
    stop: stopRes
      ? { id: stopRes.id, name: stopRes.attributes.name }
      : relId(res.relationships?.stop)
        ? { id: relId(res.relationships?.stop)!, name: '' }
        : null,
  }
}

export type VehiclePage = PageInfo & { items: Vehicle[] }

export async function listVehicles(
  opts: {
    page: number
    pageSize: number
    routes: string[]
    trips: string[]
  },
  signal?: AbortSignal,
): Promise<VehiclePage> {
  const offset = (opts.page - 1) * opts.pageSize
  const body = await mbtaGet<JsonApiList<Resource<VehicleAttrs, VehicleRels>>>(
    '/vehicles',
    {
      include: INCLUDE,
      'page[limit]': opts.pageSize,
      'page[offset]': offset,
      'filter[route]': opts.routes.join(',') || undefined,
      'filter[trip]': opts.trips.join(',') || undefined,
    },
    signal,
  )

  const included = indexIncluded(body.included)
  const items = body.data.map((row) => mapVehicle(row, included))
  return {
    items,
    ...paginationFromLinks({
      offset,
      pageSize: opts.pageSize,
      itemCount: items.length,
      last: body.links?.last,
    }),
  }
}

export async function getVehicle(id: string, signal?: AbortSignal): Promise<Vehicle> {
  const body = await mbtaGet<JsonApiOne<Resource<VehicleAttrs, VehicleRels>>>(
    `/vehicles/${encodeURIComponent(id)}`,
    { include: INCLUDE },
    signal,
  )
  return mapVehicle(body.data, indexIncluded(body.included))
}
