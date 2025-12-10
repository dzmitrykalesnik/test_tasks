/**
 * Product interface - shared type definition across the application
 * Used by: ProductGrid, useGridData, ProductCard, and mock API
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

