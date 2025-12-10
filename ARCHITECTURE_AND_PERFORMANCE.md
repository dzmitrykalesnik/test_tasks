# Architecture & Performance Notes

## Why We Chose Render Props

The main goal was flexibility. With render props, whoever uses `ProductGrid` gets full control over how things look, while the component itself just handles fetching data.

### Standard Props? Too Limited

If we went with regular props, we'd need to anticipate every possible customization:

```typescript
<ProductGrid
  loadingComponent={...}
  errorComponent={...}
  cardComponent={...}
  gridLayout={...}
  emptyStateComponent={...}
  // ... and it keeps growing
/>
```

The problem? You can't predict everything. Every new use case means adding more props, more conditional logic inside the component, and more maintenance headaches. The component becomes rigid and bloated.

With render props, you just get the data and loading states. Then you build whatever UI you want. Check out `ProductGridDemo.tsx` - same component powers three completely different layouts without any changes to `ProductGrid` itself.

### What About HOCs?

HOCs (Higher-Order Components) could work, but they bring their own problems:

```typescript
withData(withLoading(withError(Component))); // wrapper hell
```

You end up with:

- Deep nesting that's hard to follow
- Props that might collide (two HOCs trying to inject the same prop name)
- TypeScript types that get messy across multiple wrappers
- Extra layers in the component tree
- DevTools showing wrapper names instead of your actual component

Render props keep things flat. No wrappers, no nesting, just a function that receives what it needs.

### The Win: Clean Separation

`ProductGrid` knows **what** to fetch. You decide **how** to show it. Both sides can change independently without breaking each other.

### How It Works

```typescript
interface ProductGridRenderState {
  isLoading: boolean;
  data: Product[];
  error: string | null;
  refetchData: () => void;
}

interface Props {
  apiUrl: string;
  children: (state: ProductGridRenderState) => React.ReactNode;
}

const ProductGrid: React.FC<Props> = ({ apiUrl, children }) => {
  const { data, isLoading, error, refetchData } = useGridData(apiUrl);

  const renderState: ProductGridRenderState = {
    isLoading,
    data: data ?? [],
    error,
    refetchData,
  };

  return <>{children(renderState)}</>;
};
```

The component fetches data, packages it up with loading/error states, and hands everything to your render function.

**Example 1: Grid with skeleton loading**

```typescript
<ProductGrid apiUrl="/api/products/widgets">
  {({ isLoading, data, error, refetchData }) => {
    if (isLoading) return <LoadingSkeleton />;
    if (error) return <ErrorMessage error={error} />;
    return (
      <div className="grid">
        {data.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onRefetch={refetchData}
          />
        ))}
      </div>
    );
  }}
</ProductGrid>
```

**Example 2: Simple list with custom header**

```typescript
<ProductGrid apiUrl="/api/products/gadgets">
  {({ isLoading, data, error, refetchData }) => (
    <div>
      <h2>Products ({data.length})</h2>
      <button onClick={refetchData}>Refresh</button>
      <ul>
        {data.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  )}
</ProductGrid>
```

---

## Performance: Why Both useCallback AND React.memo?

Short answer: **they work together**. One without the other is useless.

### The Problem

React checks if props changed by comparing references, not values. For functions and objects, it's checking if they're the exact same instance in memory.

Without `useCallback`, every time `useGridData` re-renders (like when `isLoading` changes), it creates a new `refetchData` function. Same code, same behavior, but a new reference:

```
React.memo checks: props.onRefetch === prevProps.onRefetch
Without useCallback: false (always a new function)
Result: Every ProductCard re-renders, even if product data didn't change
```

If you have 50 products, that's 50 unnecessary re-renders every time the parent changes state.

Without `React.memo`, ProductCard re-renders whenever its parent does. Loading state changed? All cards re-render. Doesn't matter that their product data stayed the same.

### Why You Need Both

Think of it as a contract:

- **useCallback** says: "This function reference won't change"
- **React.memo** says: "Cool, then I can safely skip re-rendering"

If you only use one:

- Just useCallback? Still re-renders because React.memo isn't there to bail out
- Just React.memo? Fails its comparison check because the function reference keeps changing

Together? ProductCard only re-renders when its actual product data changes. In a 50-product grid, when loading toggles, all 50 cards stay put instead of re-rendering.

### The Code

**useCallback (useGridData.ts):**

```typescript
const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

const refetchData = useCallback(() => {
  setRefetchTrigger((prev) => prev + 1);
}, []); // Empty array = same reference forever
```

The empty dependency array means this function gets created once and reused forever.

**React.memo (ProductCard.tsx):**

```typescript
interface Props {
  product: Product;
  onRefetch?: () => void;
}

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

export default React.memo(ProductCard);
```

React.memo wraps the component and does a shallow check on props. If `product` and `onRefetch` references haven't changed, it skips the render.

### The Tradeoff

React.memo adds a tiny overhead (doing the comparison), but it's worth it. The comparison is cheap. Re-rendering 50 cards is expensive.

### Result

Add 10 products? 100 products? Doesn't matter. Only cards with actual changes re-render. The rest sit tight.

---

## Bonus: Race Condition Handling

Quick scenario: user switches from `/widgets` to `/gadgets`. The widgets request is slow, gadgets is fast. Gadgets finishes first, updates the state. Then widgets finishes and... overwrites with the wrong data.

We use `AbortController` to cancel old requests:

1. New fetch starts → create new AbortController
2. Pass its signal to fetch
3. URL changes → cleanup runs → call `abort()`
4. Old fetch throws AbortError → we catch and ignore it
5. Only the latest fetch can update state

No race conditions, no stale data.

## Minor Detail: Data Consistency

We always return an empty array instead of null when there's no data:

```typescript
data: data ?? [];
```

This way, consumers don't need null checks. They can just map over the array or check `data.length === 0`.

---

## Summary

Render props give you flexibility without bloat. useCallback + React.memo give you performance that scales. Together, you get a component that's both powerful and fast, whether you're showing 10 items or 1000.
