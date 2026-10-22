import { describe, expect, it } from 'vitest'
import { parseSearch, toSearch } from './searchState.ts'

describe('searchState', () => {
  it('parses defaults from an empty query', () => {
    expect(parseSearch('')).toEqual({
      page: 1,
      pageSize: 10,
      routes: [],
      trips: [],
      vehicleId: null,
    })
  })

  it('round-trips non-default values', () => {
    const state = parseSearch('?page=3&pageSize=20&routes=Orange,111&trips=abc&vehicle=y2001')
    expect(state.page).toBe(3)
    expect(state.pageSize).toBe(20)
    expect(state.routes).toEqual(['111', 'Orange'])
    expect(state.trips).toEqual(['abc'])
    expect(state.vehicleId).toBe('y2001')
    expect(parseSearch(toSearch(state))).toEqual(state)
  })

  it('falls back on bad page and pageSize', () => {
    const state = parseSearch('page=-2&pageSize=7')
    expect(state.page).toBe(1)
    expect(state.pageSize).toBe(10)
  })

  it('omits defaults when serializing', () => {
    expect(toSearch(parseSearch(''))).toBe('')
  })
})
