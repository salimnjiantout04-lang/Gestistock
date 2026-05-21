import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 max-w-lg mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-700 font-bold mb-2">Une erreur est survenue</h2>
          <pre className="text-red-600 text-sm whitespace-pre-wrap break-all">
            {this.state.error.message}
          </pre>
          {this.state.error.stack && (
            <details className="mt-2">
              <summary className="text-red-500 text-xs cursor-pointer">Détails techniques</summary>
              <pre className="text-red-400 text-xs mt-1 whitespace-pre-wrap break-all">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
