import { describe, expect, it } from 'vitest'
import type { Resource, VehicleAttrs, VehicleRels } from '../types/mbta.ts'
import { mapVehicle } from '../features/vehicles/api.ts'
import { indexIncluded, pickIncluded, relId } from './jsonApi.ts'

const vehicle: Resource<VehicleAttrs, VehicleRels> = {
  id: 'y2001',
  type: 'vehicle',
  attributes: {
    bearing: 348,
    current_status: 'IN_TRANSIT_TO',
    current_stop_sequence: 3,
    direction_id: 0,
    label: '2001',
    latitude: 42.36,
    longitude: -71.05,
    occupancy_status: 'MANY_SEATS_AVAILABLE',
    speed: null,
    updated_at: '2026-10-21T09:02:11-04:00',
  },
  relationships: {
    route: { data: { id: '111', type: 'route' } },
    trip: { data: { id: '78265779', type: 'trip' } },
    stop: { data: { id: '5611', type: 'stop' } },
  },
}

describe('jsonApi include join', () => {
  it('indexes included resources by type:id', () => {
    const index = indexIncluded([
      {
        id: '111',
        type: 'route',
        attributes: { long_name: 'Woodlawn', short_name: '111', color: 'FFC72C' },
      },
    ])
    expect(pickIncluded(index, 'route', '111')?.attributes).toMatchObject({ short_name: '111' })
    expect(pickIncluded(index, 'route', 'missing')).toBeUndefined()
  })

  it('joins route trip and stop onto a vehicle', () => {
    const included = indexIncluded([
      {
        id: '111',
        type: 'route',
        attributes: {
          color: 'FFC72C',
          long_name: 'Woodlawn - Haymarket Station',
          short_name: '111',
          sort_order: 1,
          direction_names: ['Outbound', 'Inbound'],
          direction_destinations: ['Woodlawn', 'Haymarket Station'],
        },
      },
      {
        id: '78265779',
        type: 'trip',
        attributes: { headsign: 'Woodlawn', name: '', direction_id: 0 },
      },
      { id: '5611', type: 'stop', attributes: { name: 'Beacon St @ Broadway' } },
    ])
    const mapped = mapVehicle(vehicle, included)
    expect(mapped.label).toBe('2001')
    expect(mapped.route?.shortName).toBe('111')
    expect(mapped.route?.color).toBe('FFC72C')
    expect(mapped.trip?.headsign).toBe('Woodlawn')
    expect(mapped.stop?.name).toBe('Beacon St @ Broadway')
  })

  it('keeps relationship ids when include is missing', () => {
    const mapped = mapVehicle(vehicle, indexIncluded())
    expect(mapped.route?.id).toBe('111')
    expect(mapped.route?.longName).toBe('')
    expect(relId(vehicle.relationships?.trip)).toBe('78265779')
  })
})
