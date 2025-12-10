import styles from './CustomLoadingSkeleton.module.css';

interface Props {
  count?: number;
}

export function CustomLoadingSkeleton({ count = 6 }: Props) {
  return (
    <div className={styles.gridLayout}>
      {Array.from({ length: count }, (_, i) => (
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

