import React from 'react';
import type { Product } from '../types/product';
import { useGridData } from '../hooks/useGridData';
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

export default ProductGrid;

