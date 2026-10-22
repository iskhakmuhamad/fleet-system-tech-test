import type { ReactNode } from 'react'
import { pageWindow, rangeLabel } from '../../lib/pagination.ts'
import { PAGE_SIZES, type PageSize } from '../../lib/searchState.ts'

type Props = {
  page: number
  pageSize: PageSize
  from: number
  to: number
  totalItems: number
  totalPages: number
  onPage: (page: number) => void
  onPageSize: (size: PageSize) => void
}

export function PaginationBar({
  page,
  pageSize,
  from,
  to,
  totalItems,
  totalPages,
  onPage,
  onPageSize,
}: Props) {
  const pages = pageWindow(page, totalPages)
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">{rangeLabel(from, to, totalItems)}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          Per page
          <select
            className="cursor-pointer rounded-md border border-line bg-card px-2 py-1 text-ink"
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value) as PageSize)}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PageBtn disabled={prevDisabled} onClick={() => onPage(page - 1)}>
            Prev
          </PageBtn>
          {pages.map((item, i) =>
            item === 'gap' ? (
              <span key={`g-${i}`} className="px-1 text-muted">
                …
              </span>
            ) : (
              <PageBtn key={item} current={item === page} onClick={() => onPage(item)}>
                {item}
              </PageBtn>
            ),
          )}
          <PageBtn disabled={nextDisabled} onClick={() => onPage(page + 1)}>
            Next
          </PageBtn>
        </nav>
        <span className="text-xs text-muted">{totalPages} pages</span>
      </div>
    </div>
  )
}

function PageBtn({
  children,
  onClick,
  disabled,
  current,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  current?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={current ? 'page' : undefined}
      className={`min-w-8 cursor-pointer rounded-md px-2 py-1 text-sm disabled:cursor-not-allowed ${
        current
          ? 'bg-tj text-white'
          : 'border border-line bg-card text-ink hover:bg-stone-100 disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  )
}
