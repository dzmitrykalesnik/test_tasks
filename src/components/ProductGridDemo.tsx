import ProductGrid from './ProductGrid';
import ProductCard from './ProductCard';
import styles from './ProductGridDemo.module.css';

/**
 * ProductGridDemo Component - Showcase for ProductGrid
 * 
 * This component demonstrates three different usage patterns of the ProductGrid component,
 * showcasing the flexibility of the Render Props pattern.
 * 
 * Each example shows how the same ProductGrid component can be customized to display
 * data in completely different ways, all while maintaining the same data fetching logic.
 */
export function ProductGridDemo() {
  return (
    <div className={styles.appContainer}>
      <h1 className={styles.mainTitle}>ProductGrid Component Demo</h1>
      <p className={styles.subtitle}>
        Demonstrating the Render Props pattern with three different customization examples
      </p>

      {/* ============================================================
          EXAMPLE 1: Custom Loading Skeleton & Grid Layout
          ============================================================
          
          This example demonstrates:
          - Custom loading UI with skeleton cards
          - Custom error handling with styled error message
          - Grid layout using CSS Grid
          - ProductCard components with refetch capability
          - How consumers have full control over presentation
      */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Example 1: Grid Layout with Loading Skeleton</h2>
        <p className={styles.sectionDescription}>
          Custom grid layout with skeleton loading state and memoized product cards
        </p>

        <ProductGrid apiUrl="/api/products/widgets">
          {({ isLoading, data, error, refetchData }) => {
            // Custom loading state with skeleton cards
            if (isLoading && data.length === 0) {
              return (
                <div className={styles.gridLayout}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={styles.skeletonCard}>
                      <div className={styles.skeletonHeader}></div>
                      <div className={styles.skeletonText}></div>
                      <div className={styles.skeletonText}></div>
                      <div className={styles.skeletonFooter}></div>
                    </div>
                  ))}
                </div>
              );
            }

            // Custom error state
            if (error) {
              return (
                <div className={styles.errorContainer}>
                  <div className={styles.errorIcon}>⚠️</div>
                  <h3 className={styles.errorTitle}>Failed to Load Products</h3>
                  <p className={styles.errorMessage}>{error}</p>
                  <button className={styles.retryButton} onClick={refetchData}>
                    Try Again
                  </button>
                </div>
              );
            }

            // Main content: grid of product cards
            return (
              <div>
                <div className={styles.gridLayout}>
                  {data.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onRefetch={refetchData}
                    />
                  ))}
                </div>
                {data.length === 0 && (
                  <div className={styles.emptyState}>No products available</div>
                )}
              </div>
            );
          }}
        </ProductGrid>
      </section>

      {/* ============================================================
          EXAMPLE 2: Minimal List View
          ============================================================
          
          This example demonstrates:
          - Simple list layout instead of grid
          - Minimal styling approach
          - Different error message presentation
          - How the same component adapts to different UI patterns
      */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Example 2: Simple List View</h2>
        <p className={styles.sectionDescription}>
          Minimalist list layout showing the flexibility of render props
        </p>

        <ProductGrid apiUrl="/api/products/gadgets">
          {({ isLoading, data, error, refetchData }) => {
            if (isLoading && data.length === 0) {
              return <div className={styles.loadingText}>Loading gadgets...</div>;
            }

            if (error) {
              return (
                <div className={styles.errorBanner}>
                  <span>Error: {error}</span>
                  <button className={styles.smallButton} onClick={refetchData}>
                    Reload
                  </button>
                </div>
              );
            }

            return (
              <div className={styles.listContainer}>
                {data.map((product) => (
                  <div key={product.id} className={styles.listItem}>
                    <div className={styles.listItemContent}>
                      <span className={styles.listItemName}>{product.name}</span>
                      <span className={styles.listItemPrice}>
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className={styles.listItemDescription}>{product.description}</p>
                  </div>
                ))}
                {data.length === 0 && (
                  <div className={styles.emptyState}>No gadgets found</div>
                )}
              </div>
            );
          }}
        </ProductGrid>
      </section>

      {/* ============================================================
          EXAMPLE 3: Data Count Header with Actions
          ============================================================
          
          This example demonstrates:
          - Header with dynamic data count
          - Refetch button in header (outside of cards)
          - Compact card layout
          - Passing refetchData to different UI elements
          - How state can be used across multiple UI sections
      */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Example 3: Header with Data Count & Actions</h2>
        <p className={styles.sectionDescription}>
          Custom header showing count and refresh action, demonstrating state composition
        </p>

        <ProductGrid apiUrl="/api/products/featured">
          {({ isLoading, data, error, refetchData }) => (
            <div>
              {/* Custom header using grid state */}
              <div className={styles.customHeader}>
                <div>
                  <h3 className={styles.customHeaderTitle}>Featured Products</h3>
                  <span className={styles.customHeaderCount}>
                    {isLoading ? 'Loading...' : `${data.length} items`}
                  </span>
                </div>
                <button className={styles.primaryButton} onClick={refetchData}>
                  ↻ Refresh Data
                </button>
              </div>

              {/* Error state */}
              {error && (
                <div className={styles.inlineError}>
                  Failed to load: {error}
                </div>
              )}

              {/* Products display */}
              {!error && (
                <div className={styles.compactGrid}>
                  {data.map((product) => (
                    <div key={product.id} className={styles.compactCard}>
                      <div className={styles.compactCardHeader}>
                        <h4 className={styles.compactCardTitle}>{product.name}</h4>
                        <span className={styles.compactCardPrice}>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className={styles.compactCardDescription}>
                        {product.description}
                      </p>
                    </div>
                  ))}
                  {data.length === 0 && !isLoading && (
                    <div className={styles.emptyState}>No featured products</div>
                  )}
                </div>
              )}
            </div>
          )}
        </ProductGrid>
      </section>
    </div>
  );
}

