export type PageInfo = {
  from: number
  to: number
  totalItems: number
  totalPages: number
  isLast: boolean
}

export function offsetFromLink(link: string | undefined): number | null {
  if (!link) return null
  try {
    const url = new URL(link)
    const raw = url.searchParams.get('page[offset]')
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

// JSON:API list endpoints here do not send meta.total.
// links.last holds the last page's offset; short last pages are corrected
// when we actually land on them (itemCount < pageSize, or offset >= lastOffset).
export function paginationFromLinks(opts: {
  offset: number
  pageSize: number
  itemCount: number
  last?: string
}): PageInfo {
  const lastOffset = offsetFromLink(opts.last)
  const isLast =
    opts.itemCount < opts.pageSize ||
    lastOffset == null ||
    opts.offset >= lastOffset

  const totalItems = isLast
    ? opts.offset + opts.itemCount
    : lastOffset + opts.pageSize

  const totalPages =
    totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / opts.pageSize))

  const from = opts.itemCount === 0 ? 0 : opts.offset + 1
  const to = opts.offset + opts.itemCount

  return { from, to, totalItems, totalPages, isLast }
}

export function rangeLabel(from: number, to: number, total: number): string {
  if (total === 0) return 'Showing 0 of 0 vehicles'
  return `Showing ${from}-${to} of ${total} vehicles`
}

export function pageWindow(
  current: number,
  total: number,
  radius = 2,
): Array<number | 'gap'> {
  if (total <= 1) return [1]
  const pages = new Set<number>([1, total])
  for (let i = current - radius; i <= current + radius; i++) {
    if (i >= 1 && i <= total) pages.add(i)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: Array<number | 'gap'> = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push('gap')
    out.push(sorted[i]!)
  }
  return out
}
