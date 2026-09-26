import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    const message = error?.message || ''
    const isDomConflict =
      message.includes('removeChild') ||
      message.includes('NotFoundError') ||
      message.includes("the node to be removed is not a child")

    if (isDomConflict) {
      const key = 'gestistock_autoreload'
      const count = parseInt(sessionStorage.getItem(key) || '0', 10)
      if (count < 2) {
        sessionStorage.setItem(key, String(count + 1))
        window.location.reload()
      } else {
        sessionStorage.removeItem(key)
      }
    } else {
      console.error('Erreur de rendu:', error)
    }
  }

  componentDidMount() {
    window.addEventListener('error', this.handleGlobal)
    window.addEventListener('unhandledrejection', this.handleGlobal)
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobal)
    window.removeEventListener('unhandledrejection', this.handleGlobal)
  }

  handleGlobal = (e) => {
    const message = e?.reason?.message || e?.message || String(e || 'Erreur inconnue')
    if (message.includes('removeChild')) return
    console.error('Erreur globale (non bloquante):', e)
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
