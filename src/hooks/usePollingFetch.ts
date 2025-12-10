import { useEffect, useState } from 'react';

/**
 * Interface for the return value of usePollingFetch hook
 */
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
    /**
     * RACE CONDITION PREVENTION MECHANISM:
     * 
     * We use AbortController to prevent race conditions when the URL changes or
     * the component unmounts while a fetch is in progress.
     * 
     * How it works:
     * 1. When the effect runs, we create a new AbortController instance
     * 2. The controller's signal is passed to the fetch request
     * 3. When the effect cleanup runs (due to URL change or unmount):
     *    - The cleanup function calls abortController.abort()
     *    - This causes the fetch to throw an AbortError
     *    - We catch the AbortError and ignore it (don't update state)
     * 4. Only the most recent fetch (with non-aborted signal) can update state
     * 
     * This prevents the scenario where:
     * - User requests URL A (slow response)
     * - User requests URL B (fast response)
     * - URL B completes and updates state
     * - URL A completes later and incorrectly overwrites state with stale data
     * 
     * With AbortController, URL A's fetch is cancelled when URL B is requested,
     * ensuring only the latest data reaches the state.
     */
    const abortController = new AbortController();
    let intervalId: ReturnType<typeof setInterval> | undefined;

    /**
     * Async function to fetch data from the provided URL
     */
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Pass the abort signal to fetch so it can be cancelled
        const response = await fetch(url, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Only update state if the request wasn't aborted
        setData(result);
        setIsLoading(false);
      } catch (err) {
        // Ignore AbortError - this is expected when the request is cancelled
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, don't update state
          return;
        }

        // Handle other errors
        console.error('Fetch error:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling if interval is provided and greater than 0
    if (interval && interval > 0) {
      intervalId = setInterval(() => {
        fetchData();
      }, interval);
    }

    // Cleanup function runs when:
    // 1. Component unmounts
    // 2. URL or interval changes (before re-running the effect)
    return () => {
      // Abort any in-flight fetch requests
      abortController.abort();

      // Clear the polling interval if it exists
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [url, interval]); // Re-run effect when URL or interval changes

  return { data, isLoading, error };
}

