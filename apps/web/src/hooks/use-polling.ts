import { useEffect, useRef, useCallback, useState } from "react";

export interface UsePollingOptions<T> {
  /** Async fetcher function — receives AbortSignal for cleanup */
  fetcher: (signal: AbortSignal) => Promise<T>;
  /** Polling interval in milliseconds (default: 10000) */
  intervalMs?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
}

export interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Timestamp of last successful fetch */
  lastUpdated: number | null;
  /** Manually trigger a refresh */
  refresh: () => void;
}

export function usePolling<T>(options: UsePollingOptions<T>): UsePollingResult<T> {
  const { fetcher, intervalMs = 10_000, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const tickRef = useRef(0);

  const doFetch = useCallback(async (signal: AbortSignal) => {
    try {
      const result = await fetcherRef.current(signal);
      if (!signal.aborted) {
        setData(result);
        setError(null);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      if (!signal.aborted) {
        setError((err as Error).message);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    if (!enabled) return;

    const ctrl = new AbortController();
    setLoading(true);
    doFetch(ctrl.signal);

    const id = setInterval(() => {
      doFetch(ctrl.signal);
    }, intervalMs);

    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, [enabled, intervalMs, doFetch]);

  // Manual refresh
  const refresh = useCallback(() => {
    tickRef.current += 1;
    const ctrl = new AbortController();
    setLoading(true);
    doFetch(ctrl.signal);
  }, [doFetch]);

  return { data, loading, error, lastUpdated, refresh };
}
