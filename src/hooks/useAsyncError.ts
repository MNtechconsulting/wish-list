import { useCallback, useState } from 'react'

/**
 * Hook for handling async errors and propagating them to error boundaries
 * Provides error state management for async operations
 * Requirements: 5.4
 */
export function useAsyncError() {
  const [, setError] = useState<Error | null>(null)

  const throwError = useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])

  return throwError
}

/**
 * Hook for managing async operation states (loading, error, data)
 */
export function useAsyncState<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}