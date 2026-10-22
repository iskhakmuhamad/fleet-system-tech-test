export type RelRef = {
  data: { id: string; type: string } | null
}

export type Resource<TAttrs, TRels = Record<string, RelRef | undefined>> = {
  id: string
  type: string
  attributes: TAttrs
  relationships?: TRels
}

export type JsonApiList<T> = {
  data: T[]
  included?: Resource<unknown>[]
  links?: {
    first?: string
    last?: string
    next?: string
    prev?: string
  }
}

export type JsonApiOne<T> = {
  data: T
  included?: Resource<unknown>[]
}

export type VehicleAttrs = {
  bearing: number | null
  current_status: string
  current_stop_sequence: number | null
  direction_id: number | null
  label: string | null
  latitude: number | null
  longitude: number | null
  occupancy_status: string | null
  speed: number | null
  updated_at: string
}

export type VehicleRels = {
  route?: RelRef
  trip?: RelRef
  stop?: RelRef
}

export type RouteAttrs = {
  color: string | null
  long_name: string
  short_name: string
  sort_order: number
  direction_names: string[] | null
  direction_destinations: string[] | null
}

export type TripAttrs = {
  headsign: string | null
  name: string | null
  direction_id: number | null
}

export type StopAttrs = {
  name: string
}

export type VehicleRoute = {
  id: string
  shortName: string
  longName: string
  color: string
  directionNames: string[]
}

export type VehicleTrip = {
  id: string
  headsign: string
  name: string
}

export type VehicleStop = {
  id: string
  name: string
}

export type Vehicle = {
  id: string
  label: string
  status: string
  lat: number | null
  lng: number | null
  updatedAt: string
  occupancy: string | null
  bearing: number | null
  speed: number | null
  directionId: number | null
  route: VehicleRoute | null
  trip: VehicleTrip | null
  stop: VehicleStop | null
}
