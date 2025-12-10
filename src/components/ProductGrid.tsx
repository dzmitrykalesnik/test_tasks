import React from 'react';
import type { Product } from '../types/product';
import { useGridData } from '../hooks/useGridData';

/**
 * Render function state interface
 * This is what gets passed to the consumer's render function
 */
interface ProductGridRenderState {
  isLoading: boolean;
  data: Product[];
  error: string | null;
  refetchData: () => void;
}

/**
 * ProductGrid component props interface
 * 
 * RENDER PROPS PATTERN:
 * The 'children' prop is a function that receives grid state and returns React elements.
 * This gives consumers complete control over how the data is presented.
 */
interface Props {
  apiUrl: string;
  children: (state: ProductGridRenderState) => React.ReactNode;
}

/**
 * ProductGrid Component
 * 
 * A flexible, reusable component for displaying product grids using the Render Props pattern.
 * 
 * ============================================================================
 * ARCHITECTURE RATIONALE: Why Render Props Pattern is Superior
 * ============================================================================
 * 
 * The Render Props pattern provides maximum flexibility through *inversion of 
 * control*, giving consumers complete ownership of presentation logic while this 
 * component retains data-fetching responsibilities.
 * 
 * WHY RENDER PROPS BEATS STANDARD PROPS:
 * 
 * Standard props require predicting every customization consumers might need 
 * (loading components, error layouts, card styles, etc.), leading to "prop explosion."
 * This ProductGrid would need props like:
 *   - loadingComponent, errorComponent, cardComponent
 *   - gridLayout, emptyStateComponent, headerComponent
 *   - cardProps, gridProps, etc.
 * 
 * Problems with standard props approach:
 *   • Creates a rigid API that can't accommodate unforeseen use cases
 *   • Forces the component to handle conditional rendering logic internally
 *   • Limits consumers to pre-defined customization points
 *   • Component becomes bloated with conditional logic for every variation
 * 
 * With Render Props, consumers receive raw state (isLoading, data, error, refetchData) 
 * and construct *any* UI they need. See ProductGridDemo.tsx for three completely 
 * different UIs (skeleton grids, minimal lists, custom headers)—all without modifying 
 * this component.
 * 
 * WHY RENDER PROPS BEATS HOCs:
 * 
 * Higher-Order Components (HOCs) wrap components and inject props, but suffer from:
 *   • Composition complexity: Multiple HOCs create "wrapper hell" and obscure hierarchy
 *     Example: withData(withLoading(withError(Component))) becomes hard to reason about
 *   • Prop name collisions: Different HOCs might inject conflicting prop names
 *   • TypeScript friction: Generic typing across HOC chains becomes cumbersome
 *   • Runtime indirection: HOCs add extra component layers in the React tree
 *   • Debugging difficulty: Component names in DevTools show wrappers, not originals
 * 
 * Render Props maintain flat composition, provide explicit TypeScript inference on 
 * the render function signature, and avoid wrapper components entirely.
 * 
 * KEY ARCHITECTURAL WIN:
 * Separation of concerns is surgical—ProductGrid owns *what* data to fetch; 
 * consumers own *how* to display it. This single-responsibility design enables 
 * both to evolve independently without breaking changes.
 * 
 * ============================================================================
 * PERFORMANCE BENEFITS
 * ============================================================================
 * 
 * - useGridData hook uses useCallback for refetchData, ensuring stable reference
 * - Consumers can use React.memo on child components without worrying about
 *   callback reference changes
 * - Only the consumer's render function re-runs on state changes, not internal
 *   ProductGrid logic
 * 
 * See ProductCard.tsx and useGridData.ts for detailed performance optimization
 * explanations regarding React.memo and useCallback synergy.
 * 
 * @example
 * // Custom grid layout with loading skeleton
 * <ProductGrid apiUrl="/api/products/widgets">
 *   {({ isLoading, data, error, refetchData }) => {
 *     if (isLoading) return <LoadingSkeleton />;
 *     if (error) return <ErrorMessage error={error} />;
 *     return (
 *       <div className="grid">
 *         {data.map(product => (
 *           <ProductCard key={product.id} product={product} onRefetch={refetchData} />
 *         ))}
 *       </div>
 *     );
 *   }}
 * </ProductGrid>
 * 
 * @example
 * // Simple list view with custom header
 * <ProductGrid apiUrl="/api/products/gadgets">
 *   {({ isLoading, data, error, refetchData }) => (
 *     <div>
 *       <h2>Products ({data.length})</h2>
 *       <button onClick={refetchData}>Refresh</button>
 *       <ul>
 *         {data.map(p => <li key={p.id}>{p.name}</li>)}
 *       </ul>
 *     </div>
 *   )}
 * </ProductGrid>
 */
const ProductGrid: React.FC<Props> = ({ apiUrl, children }) => {
  // Use the custom hook to manage data fetching
  const { data, isLoading, error, refetchData } = useGridData(apiUrl);

  /**
   * Prepare the state object to pass to the render function
   * 
   * IMPORTANT: We provide an empty array as fallback for data when it's null.
   * This ensures consumers always receive a consistent data type (Product[])
   * and don't need to handle null checks in their render logic.
   * 
   * The consumer can determine if data is ready by checking isLoading or
   * checking data.length === 0.
   */
  const renderState: ProductGridRenderState = {
    isLoading,
    data: data ?? [], // Provide empty array if data is null
    error,
    refetchData, // This is memoized via useCallback in useGridData
  };

  /**
   * Call the render function with the current state
   * 
   * This is the core of the Render Props pattern - we invoke the function
   * passed as children with our state, and it returns the UI to render.
   */
  return <>{children(renderState)}</>;
};

export default ProductGrid;

