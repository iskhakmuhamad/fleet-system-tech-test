import type { RelRef, Resource } from '../types/mbta.ts'

export function includedKey(type: string, id: string): string {
  return `${type}:${id}`
}

export function indexIncluded(included: Resource<unknown>[] = []): Map<string, Resource<unknown>> {
  const map = new Map<string, Resource<unknown>>()
  for (const item of included) {
    map.set(includedKey(item.type, item.id), item)
  }
  return map
}

export function relId(rel: RelRef | undefined): string | undefined {
  return rel?.data?.id
}

export function pickIncluded<TAttrs>(
  index: Map<string, Resource<unknown>>,
  type: string,
  id: string | undefined,
): Resource<TAttrs> | undefined {
  if (!id) return undefined
  return index.get(includedKey(type, id)) as Resource<TAttrs> | undefined
}
