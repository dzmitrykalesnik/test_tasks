import { useEffect, useState } from 'react';
interface UsePollingFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: boolean;
}

/**
 * Custom hook for fetching data with optional polling and race condition prevention
 * 
 * @template T - The type of data expected from the API
 * @param url - The URL to fetch data from
 * @param interval - Optional polling interval in milliseconds (default: undefined = no polling)
 * @returns Object containing data, isLoading state, and error state
 * 
 * @example
 * // Single fetch without polling
 * const { data, isLoading, error } = usePollingFetch<User>('https://api.example.com/user');
 * 
 * @example
 * // Fetch with polling every 5 seconds
 * const { data, isLoading, error } = usePollingFetch<Post[]>('https://api.example.com/posts', 5000);
 */
export function usePollingFetch<T>(
  url: string,
  interval?: number
): UsePollingFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const abortController = new AbortController();
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const response = await fetch(url, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        setData(result);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        console.error('Fetch error:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    fetchData();

    if (interval && interval > 0) {
      intervalId = setInterval(() => {
        fetchData();
      }, interval);
    }

    return () => {
      abortController.abort();

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [url, interval]);

  return { data, isLoading, error };
}

