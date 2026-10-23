const BASE = import.meta.env.VITE_MBTA_API_BASE

export class MbtaError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'MbtaError'
    this.status = status
  }
}

export async function mbtaGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, BASE)
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    url.searchParams.set(key, String(value))
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.api+json',
  }
  const apiKey = import.meta.env.VITE_MBTA_API_KEY
  if (apiKey) headers['x-api-key'] = apiKey

  const res = await fetch(url, { headers, signal })
  if (!res.ok) {
    throw new MbtaError(messageForStatus(res.status), res.status)
  }

  try {
    return (await res.json()) as T
  } catch {
    throw new MbtaError('MBTA returned a response that was not JSON.', res.status)
  }
}

function messageForStatus(status: number): string {
  if (status === 429) {
    return 'Rate limited by MBTA. Wait a moment, or set VITE_MBTA_API_KEY.'
  }
  if (status === 404) return 'That record was not found.'
  if (status >= 500) return 'MBTA is unavailable right now. Try again shortly.'
  return `MBTA request failed (${status}).`
}
