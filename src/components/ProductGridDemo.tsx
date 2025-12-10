import ProductGrid from './ProductGrid';
import CustomProductCard from './CustomProductCard';
import { CustomLoadingSkeleton } from './CustomLoadingSkeleton';
import styles from './ProductGridDemo.module.css';

export function ProductGridDemo() {
  return (
    <div className={styles.appContainer}>
      <h1 className={styles.mainTitle}>ProductGrid Component Demo</h1>
      <p className={styles.subtitle}>
        Demonstrating the Render Props pattern with three different customization examples
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Example 1: Grid Layout with Loading Skeleton</h2>
        <p className={styles.sectionDescription}>
          Custom grid layout with skeleton loading state and memoized product cards
        </p>

        <ProductGrid apiUrl="/api/products/widgets">
          {({ isLoading, data, error, refetchData }) => {
            if (isLoading && data.length === 0) {
              return <CustomLoadingSkeleton count={6} />;
            }

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

              return (
                <div>
                  <div className={styles.gridLayout}>
                    {data.map((product) => (
                      <CustomProductCard
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Example 3: Header with Data Count & Actions</h2>
        <p className={styles.sectionDescription}>
          Custom header showing count and refresh action, demonstrating state composition
        </p>

        <ProductGrid apiUrl="/api/products/featured">
          {({ isLoading, data, error, refetchData }) => (
            <div>
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

              {error && (
                <div className={styles.inlineError}>
                  Failed to load: {error}
                </div>
              )}

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

