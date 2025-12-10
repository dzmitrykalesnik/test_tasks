import React from 'react';
import type { Product } from '../types/product';
import styles from './CustomProductCard.module.css';

interface Props {
  product: Product;
  onRefetch?: () => void;
}

const CustomProductCard: React.FC<Props> = ({ product, onRefetch }) => {
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

export default React.memo(CustomProductCard);

