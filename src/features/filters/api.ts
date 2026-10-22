import { offsetFromLink } from '../../lib/pagination.ts'
import { mbtaGet } from '../../lib/mbtaClient.ts'
import type { JsonApiList, Resource, RouteAttrs, TripAttrs } from '../../types/mbta.ts'

export type FilterOption = {
  id: string
  label: string
  hint?: string
}

export type OptionPage = {
  items: FilterOption[]
  nextOffset: number | undefined
}

const PAGE = 20

function nextOffset(lastCount: number, offset: number, next?: string): number | undefined {
  const fromLink = offsetFromLink(next)
  if (fromLink != null) return fromLink
  if (lastCount < PAGE) return undefined
  return offset + PAGE
}

export async function listRoutes(offset: number, signal?: AbortSignal): Promise<OptionPage> {
  const body = await mbtaGet<JsonApiList<Resource<RouteAttrs>>>(
    '/routes',
    {
      'page[limit]': PAGE,
      'page[offset]': offset,
      sort: 'sort_order',
    },
    signal,
  )
  const items = body.data.map((row) => {
    const short = row.attributes.short_name?.trim()
    const long = row.attributes.long_name?.trim()
    return {
      id: row.id,
      label: short || long || row.id,
      hint: short && long && short !== long ? long : undefined,
    }
  })
  return { items, nextOffset: nextOffset(items.length, offset, body.links?.next) }
}

export async function listTrips(
  offset: number,
  routeIds: string[],
  signal?: AbortSignal,
): Promise<OptionPage> {
  const body = await mbtaGet<JsonApiList<Resource<TripAttrs>>>(
    '/trips',
    {
      'page[limit]': PAGE,
      'page[offset]': offset,
      'filter[route]': routeIds.join(',') || undefined,
    },
    signal,
  )
  const items = body.data.map((row) => {
    const head = row.attributes.headsign?.trim()
    const name = row.attributes.name?.trim()
    return {
      id: row.id,
      label: head || name || row.id,
      hint: head || name ? row.id : undefined,
    }
  })
  return { items, nextOffset: nextOffset(items.length, offset, body.links?.next) }
}
