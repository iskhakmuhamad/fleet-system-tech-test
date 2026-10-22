import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { err: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  render() {
    if (this.state.err) {
      return (
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-ink">Something broke</h1>
          <p className="mt-2 text-sm text-muted">{this.state.err.message}</p>
          <button
            type="button"
            className="mt-6 rounded-md bg-tj px-3 py-2 text-sm text-white hover:bg-tj-dark"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
