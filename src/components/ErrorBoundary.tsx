import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component to catch and handle React component errors
 * Provides graceful degradation when components fail to render
 * Requirements: 5.4
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-theme-background flex items-center justify-center p-4 theme-transition">
          <div className="theme-surface rounded-2xl shadow-theme-large p-8 max-w-md w-full text-center theme-transition">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-theme-text-primary mb-4 theme-transition">
              Oops! Something went wrong
            </h2>
            <p className="text-theme-text-secondary mb-6 theme-transition">
              We encountered an unexpected error. Don't worry, your data is safe!
            </p>
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full"
                variant="primary"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="secondary"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-theme-text-muted hover:text-theme-text-secondary theme-transition">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-theme-error bg-theme-error/10 p-2 rounded overflow-auto theme-transition">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}