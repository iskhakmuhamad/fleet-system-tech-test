import { describe, expect, it } from 'vitest'
import {
  offsetFromLink,
  pageWindow,
  paginationFromLinks,
  rangeLabel,
} from './pagination.ts'

describe('offsetFromLink', () => {
  it('reads page[offset] from a last link', () => {
    const link =
      'https://api-v3.mbta.com/vehicles?page[limit]=1&page[offset]=716'
    expect(offsetFromLink(link)).toBe(716)
  })

  it('returns null when missing', () => {
    expect(offsetFromLink(undefined)).toBeNull()
    expect(offsetFromLink('https://api-v3.mbta.com/vehicles')).toBeNull()
  })
})

describe('paginationFromLinks', () => {
  it('uses last offset to estimate totals on a middle page', () => {
    const info = paginationFromLinks({
      offset: 10,
      pageSize: 10,
      itemCount: 10,
      last: 'https://api-v3.mbta.com/vehicles?page[limit]=10&page[offset]=710',
    })
    expect(info.isLast).toBe(false)
    expect(info.from).toBe(11)
    expect(info.to).toBe(20)
    expect(info.totalItems).toBe(720)
    expect(info.totalPages).toBe(72)
  })

  it('corrects total on a short last page', () => {
    const info = paginationFromLinks({
      offset: 710,
      pageSize: 10,
      itemCount: 7,
      last: 'https://api-v3.mbta.com/vehicles?page[limit]=10&page[offset]=710',
    })
    expect(info.isLast).toBe(true)
    expect(info.totalItems).toBe(717)
    expect(info.from).toBe(711)
    expect(info.to).toBe(717)
  })

  it('handles an empty first page', () => {
    const info = paginationFromLinks({
      offset: 0,
      pageSize: 10,
      itemCount: 0,
    })
    expect(info.totalItems).toBe(0)
    expect(info.totalPages).toBe(1)
    expect(info.from).toBe(0)
    expect(info.to).toBe(0)
  })
})

describe('rangeLabel', () => {
  it('matches the brief format', () => {
    expect(rangeLabel(1, 5, 10)).toBe('Showing 1-5 of 10 vehicles')
  })
})

describe('pageWindow', () => {
  it('keeps first, last, and a radius around current', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(5, 10)).toEqual([1, 'gap', 3, 4, 5, 6, 7, 'gap', 10])
  })
})
