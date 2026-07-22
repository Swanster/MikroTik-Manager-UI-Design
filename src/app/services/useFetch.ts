import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from './types';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  latency: number | null;
  timestamp: string | null;
  retryCount: number;
}

interface UseFetchOptions {
  /** Auto-refresh interval in ms. 0 = disabled. */
  refreshInterval?: number;
  /** Max retry attempts on error */
  maxRetries?: number;
  /** Retry delay in ms (base, exponential backoff) */
  retryDelay?: number;
  /** Skip initial fetch */
  skip?: boolean;
}

/**
 * Custom hook for data fetching with loading, error, retry, and auto-refresh.
 * Works with the mockRouterOSApi ApiResponse<T> pattern.
 */
export function useFetch<T>(fetcher: () => Promise<ApiResponse<T>>, options: UseFetchOptions = {}) {
  const { refreshInterval = 0, maxRetries = 2, retryDelay = 1000, skip = false } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: !skip,
    error: null,
    latency: null,
    timestamp: null,
    retryCount: 0,
  });

  const mountedRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doFetch = useCallback(
    async (retryCount = 0) => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        retryCount,
      }));

      try {
        const response = await fetcher();

        if (!mountedRef.current) return;

        if (!response.ok) {
          // Retry logic
          if (retryCount < maxRetries) {
            const delayMs = retryDelay * Math.pow(2, retryCount);
            retryTimerRef.current = setTimeout(() => {
              doFetch(retryCount + 1);
            }, delayMs);
            return;
          }

          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Connection failed after retries. Check device connectivity.',
            latency: response.latency,
            timestamp: response.timestamp,
            retryCount,
          }));
          return;
        }

        setState({
          data: response.data,
          loading: false,
          error: null,
          latency: response.latency,
          timestamp: response.timestamp,
          retryCount,
        });
      } catch (err) {
        if (!mountedRef.current) return;

        if (retryCount < maxRetries) {
          const delayMs = retryDelay * Math.pow(2, retryCount);
          retryTimerRef.current = setTimeout(() => {
            doFetch(retryCount + 1);
          }, delayMs);
          return;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          retryCount,
        }));
      }
    },
    [fetcher, maxRetries, retryDelay],
  );

  const refetch = useCallback(() => {
    doFetch(0);
  }, [doFetch]);

  // Initial fetch
  useEffect(() => {
    if (!skip) {
      doFetch(0);
    }
    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [skip, doFetch]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0 && !skip) {
      refreshTimerRef.current = setInterval(() => {
        if (mountedRef.current && !state.loading) {
          doFetch(0);
        }
      }, refreshInterval);

      return () => {
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      };
    }
  }, [refreshInterval, skip, doFetch, state.loading]);

  return {
    ...state,
    refetch,
    isRetrying: state.retryCount > 0 && state.loading,
  };
}
