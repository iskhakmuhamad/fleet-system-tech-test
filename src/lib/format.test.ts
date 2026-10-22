import { describe, expect, it } from 'vitest'
import { occupancyLabel, relativeTime, statusLabel } from './format.ts'

describe('format', () => {
  it('maps known vehicle statuses', () => {
    expect(statusLabel('IN_TRANSIT_TO')).toBe('In transit')
    expect(statusLabel('STOPPED_AT')).toBe('Stopped')
    expect(statusLabel('INCOMING_AT')).toBe('Incoming')
    expect(statusLabel('WEIRD_STATUS')).toBe('Weird Status')
  })

  it('maps occupancy', () => {
    expect(occupancyLabel('MANY_SEATS_AVAILABLE')).toBe('Many seats')
    expect(occupancyLabel(null)).toBeNull()
  })

  it('prints relative time', () => {
    const now = Date.parse('2026-10-21T10:00:00Z')
    expect(relativeTime('2026-10-21T09:57:00Z', now)).toBe('3 min ago')
  })
})
