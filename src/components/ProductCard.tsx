import React from 'react';
import type { Product } from '../types/product';
import styles from './ProductCard.module.css';

/**
 * Props interface for ProductCard component
 */
interface Props {
  product: Product;
  onRefetch?: () => void;
}

/**
 * ProductCard Component
 * 
 * A presentational component for displaying individual product information.
 * This component is wrapped with React.memo for performance optimization.
 * 
 * ============================================================================
 * PERFORMANCE OPTIMIZATION: React.memo (Part 2 of useCallback + React.memo)
 * ============================================================================
 * 
 * React.memo is a Higher-Order Component that memoizes the component based on props.
 * It prevents re-renders when props haven't changed (shallow comparison).
 * 
 * WHY THIS IS CRITICAL:
 * 
 * 1. Without React.memo:
 *    - Every time ProductGrid re-renders (e.g., isLoading state changes during refetch)
 *    - ALL ProductCard instances would re-render, even if their product data is unchanged
 *    - In a grid with 50+ products, this creates 50x unnecessary render cycles
 *    - Each render involves: diffing virtual DOM, potentially updating real DOM, 
 *      running effect cleanup/setup, etc.
 * 
 * 2. With React.memo:
 *    - ProductCard only re-renders when its props (product, onRefetch) change
 *    - If parent re-renders but passes the same product object reference, React.memo
 *      does a shallow comparison and skips this component's render entirely
 *    - Significant performance improvement in large lists/grids
 * 
 * 3. The useCallback Connection (CRITICAL):
 *    - React.memo does SHALLOW comparison of props (===)
 *    - For primitive values (strings, numbers): comparison works as expected
 *    - For objects and functions: comparison checks REFERENCE, not content
 *    
 *    If onRefetch was NOT wrapped in useCallback in useGridData hook:
 *      • Every state change in useGridData creates a new refetchData function
 *      • React.memo sees: props.onRefetch !== prevProps.onRefetch
 *      • Memoization is bypassed, component re-renders anyway
 *      • React.memo becomes USELESS
 *    
 *    Because onRefetch IS wrapped in useCallback (with empty deps []):
 *      • refetchData maintains the same reference across all renders
 *      • React.memo sees: props.onRefetch === prevProps.onRefetch (if product unchanged)
 *      • Memoization works correctly, render is skipped
 *      • Performance optimization is EFFECTIVE
 * 
 * THE PERFORMANCE CONTRACT:
 * 
 * This creates a contract between useCallback (in useGridData.ts) and React.memo:
 *   - useCallback: "I promise this function reference won't change"
 *   - React.memo: "Given that promise, I can safely skip re-renders"
 * 
 * Without BOTH optimizations, neither works effectively:
 *   - No useCallback → React.memo always fails comparison → always re-renders
 *   - No React.memo → stable references don't matter → always re-renders
 * 
 * TRADE-OFF:
 * React.memo adds a small overhead for the prop comparison (shallow equality check),
 * but for components that render frequently or have expensive render logic, the 
 * benefits far outweigh the cost. For ProductCard with multiple elements and 
 * potential future complexity, this optimization is worthwhile.
 * 
 * RESULT: Scalable performance—grids with 100+ products remain performant.
 */
const ProductCard: React.FC<Props> = ({ product, onRefetch }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.productName}>{product.name}</h3>
        <span className={styles.productId}>ID: {product.id}</span>
      </div>
      
      <p className={styles.description}>{product.description}</p>
      
      <div className={styles.cardFooter}>
        <span className={styles.price}>${product.price.toFixed(2)}</span>
        {onRefetch && (
          <button className={styles.refreshButton} onClick={onRefetch}>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Export the memoized version of ProductCard
 * 
 * This is the version that should be imported and used in other components.
 * The memoization happens at export time, wrapping the component definition.
 */
export default React.memo(ProductCard);

