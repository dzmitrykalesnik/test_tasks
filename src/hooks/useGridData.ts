import { useEffect, useState, useCallback } from 'react';
import type { Product } from '../types/product';
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

  
  const refetchData = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(apiUrl, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: Product[] = await response.json();

        setData(result);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        console.error('Fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [apiUrl, refetchTrigger]);

  return { data, isLoading, error, refetchData };
}

