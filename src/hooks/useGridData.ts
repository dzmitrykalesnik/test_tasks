import { useEffect, useState, useCallback } from 'react';
import type { Product } from '../types/product';

/**
 * Interface for the return value of useGridData hook
 */
interface UseGridDataResult {
  data: Product[] | null;
  isLoading: boolean;
  error: string | null;
  refetchData: () => void;
}

/**
 * Custom hook for fetching product grid data with race condition prevention
 * 
 * This hook manages data fetching for the ProductGrid component, providing:
 * - Automatic data fetching on mount and when apiUrl changes
 * - Loading and error states
 * - Manual refetch capability
 * - Race condition prevention using AbortController
 * 
 * @param apiUrl - The API endpoint URL to fetch products from
 * @returns Object containing data, loading state, error state, and refetch function
 * 
 * @example
 * const { data, isLoading, error, refetchData } = useGridData('/api/products/widgets');
 * 
 * PERFORMANCE OPTIMIZATION:
 * The refetchData function is wrapped in useCallback to ensure it maintains
 * a stable reference across re-renders. This is CRITICAL for performance when
 * passing this callback to child components wrapped in React.memo, as it prevents
 * unnecessary re-renders of those children.
 */
export function useGridData(apiUrl: string): UseGridDataResult {
  const [data, setData] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  /**
   * ============================================================================
   * PERFORMANCE RATIONALE: useCallback + React.memo Synergy
   * ============================================================================
   * 
   * Both useCallback (here) and React.memo (in ProductCard) are necessary because 
   * React's reconciliation relies on reference equality for prop comparison.
   * 
   * THE PROBLEM WITHOUT useCallback:
   * 
   * When this hook's state changes (e.g., isLoading toggles), it returns a new 
   * object. Without useCallback, every re-render creates a *new* refetchData 
   * function reference, even though its behavior is identical. 
   * 
   * When passed to ProductCard (which is memoized with React.memo), the new 
   * reference causes React.memo's shallow comparison to fail:
   *   - React.memo checks: props.onRefetch === prevProps.onRefetch
   *   - Without useCallback: false (new function every time)
   *   - Result: All ProductCards re-render unnecessarily
   * 
   * In a 50-product grid, this multiplies render work by 50x on every state change.
   * 
   * THE PROBLEM WITHOUT React.memo:
   * 
   * When isLoading toggles during refetch, ProductGrid re-renders and re-invokes 
   * its render function. Without React.memo on ProductCard, every card in the grid 
   * re-renders, even though their individual product prop hasn't changed.
   * 
   * WHY BOTH ARE NECESSARY:
   * 
   * useCallback ensures refetchData maintains a stable reference across renders 
   * (empty dependency array [] means it's memoized forever). React.memo uses 
   * shallow comparison on props—if product is the same object reference AND 
   * onRefetch is the same function reference, it skips rendering.
   * 
   * **Without useCallback, React.memo becomes ineffective** because onRefetch 
   * changes every render, breaking memoization.
   * 
   * **Without React.memo, stable references don't matter** because the component 
   * always re-renders anyway.
   * 
   * This creates a PERFORMANCE CONTRACT:
   *   - useCallback provides stability guarantees
   *   - React.memo leverages those guarantees to prevent unnecessary work
   * 
   * The pattern scales efficiently—adding more products doesn't degrade performance,
   * as only cards with changed props re-render.
   * 
   * The empty dependency array means this function reference never changes,
   * but it still works correctly because it only updates a counter state.
   */
  const refetchData = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    /**
     * RACE CONDITION PREVENTION MECHANISM:
     * 
     * We use AbortController to prevent race conditions when the apiUrl changes
     * or when the component unmounts while a fetch is in progress.
     * 
     * How it works:
     * 1. When the effect runs, we create a new AbortController instance
     * 2. The controller's signal is passed to the fetch request
     * 3. When the effect cleanup runs (due to apiUrl change, refetch, or unmount):
     *    - The cleanup function calls abortController.abort()
     *    - This causes the fetch to throw an AbortError
     *    - We catch the AbortError and ignore it (don't update state)
     * 4. Only the most recent fetch (with non-aborted signal) can update state
     * 
     * This prevents scenarios where:
     * - User switches apiUrl rapidly (from /widgets to /gadgets)
     * - The /widgets request is slow, /gadgets is fast
     * - /gadgets completes and updates state
     * - /widgets completes later and incorrectly overwrites with stale data
     * 
     * With AbortController, the /widgets fetch is cancelled when apiUrl changes,
     * ensuring only the latest data reaches the state.
     */
    const abortController = new AbortController();

    /**
     * Async function to fetch product data from the provided API URL
     */
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Pass the abort signal to fetch so it can be cancelled
        const response = await fetch(apiUrl, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: Product[] = await response.json();

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
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    // Trigger the fetch
    fetchData();

    // Cleanup function runs when:
    // 1. Component unmounts
    // 2. apiUrl changes (before re-running the effect)
    // 3. refetchTrigger changes (manual refetch requested)
    return () => {
      // Abort any in-flight fetch requests
      abortController.abort();
    };
  }, [apiUrl, refetchTrigger]); // Re-run effect when apiUrl or refetchTrigger changes

  return { data, isLoading, error, refetchData };
}

