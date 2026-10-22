import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { FilterOption } from './api.ts'

type Props = {
  label: string
  values: string[]
  onChange: (ids: string[]) => void
  options: FilterOption[]
  hasMore: boolean
  loadMore: () => void
  loading: boolean
  error?: Error | null
  onRetry?: () => void
  hint?: string
  disabled?: boolean
}

export function InfiniteMultiSelect({
  label,
  values,
  onChange,
  options,
  hasMore,
  loadMore,
  loading,
  error,
  onRetry,
  hint,
  disabled,
}: Props) {
  const uid = useId()
  const listId = `${uid}-list`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const sentinelRef = useRef<HTMLLIElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => {
      return (
        o.label.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.hint?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  function openPanel() {
    setQuery('')
    setActive(0)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const el = sentinelRef.current
    const root = listRef.current
    if (!el || !root) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) loadMore()
      },
      { root, rootMargin: '80px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [open, hasMore, loading, loadMore, visible.length])

  function toggle(id: string) {
    if (values.includes(id)) onChange(values.filter((v) => v !== id))
    else onChange([...values, id])
  }

  function onListKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(visible.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && visible[active]) {
      e.preventDefault()
      toggle(visible[active]!.id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  const selected = values.map((id) => options.find((o) => o.id === id) ?? { id, label: id })

  return (
    <div ref={rootRef} className="relative min-w-[220px] flex-1">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="flex w-full min-h-10 items-center justify-between gap-2 rounded-md border border-line bg-card px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="truncate text-ink">
          {values.length === 0 ? `Any ${label.toLowerCase()}` : `${values.length} selected`}
        </span>
        <span aria-hidden className="text-muted">
          ▾
        </span>
      </button>

      {selected.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {selected.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-ink"
            >
              <span className="max-w-[140px] truncate">{item.label}</span>
              <button
                type="button"
                aria-label={`Remove ${item.label}`}
                className="text-muted hover:text-ink"
                onClick={() => toggle(item.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-line bg-card shadow-lg">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onListKey}
            placeholder="Filter loaded options"
            className="w-full border-b border-line px-3 py-2 text-sm outline-none"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={visible[active] ? `${uid}-opt-${visible[active]!.id}` : undefined}
          />
          {hint && <p className="px-3 py-1.5 text-xs text-muted">{hint}</p>}
          {error && (
            <div className="px-3 py-2 text-xs text-red-700">
              {error.message}{' '}
              {onRetry && (
                <button type="button" className="underline" onClick={onRetry}>
                  Retry
                </button>
              )}
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            className="max-h-56 overflow-auto py-1"
            onKeyDown={onListKey}
          >
            {visible.length === 0 && !loading && (
              <li className="px-3 py-2 text-sm text-muted">No matches in loaded results</li>
            )}
            {visible.map((opt, i) => {
              const picked = values.includes(opt.id)
              return (
                <li key={opt.id} id={`${uid}-opt-${opt.id}`} role="option" aria-selected={picked}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-2 px-3 py-1.5 text-left text-sm ${
                      i === active ? 'bg-stone-100' : ''
                    }`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => toggle(opt.id)}
                  >
                    <span
                      className={`mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded border ${
                        picked ? 'border-tj bg-tj' : 'border-stone-400 bg-white'
                      }`}
                    />
                    <span>
                      <span className="block text-ink">{opt.label}</span>
                      {opt.hint && <span className="block text-xs text-muted">{opt.hint}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
            <li ref={sentinelRef} className="h-1" aria-hidden />
            {loading && <li className="px-3 py-2 text-xs text-muted">Loading…</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
