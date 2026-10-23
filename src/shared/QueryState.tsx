type LoadErrorProps = {
  error: Error
  onRetry: () => void
}

export function LoadError({ error, onRetry }: LoadErrorProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-sm">
      <p className="font-medium text-red-800">Could not load data</p>
      <p className="mt-1 text-red-700">{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md bg-red-800 px-3 py-1.5 text-white hover:bg-red-900"
      >
        Try again
      </button>
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-card px-4 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div
      className="vehicle-grid"
      aria-hidden
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded bg-line/70" />
      ))}
    </div>
  )
}
