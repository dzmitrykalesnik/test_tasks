import { useState } from 'react';
import { ProductGridDemo } from './components/ProductGridDemo';
import { PollingDemo } from './components/PollingDemo';
import { initializeMockProductApi } from './utils/mockProductApi';
import styles from './App.module.css';

// Initialize mock API interceptor
initializeMockProductApi();

type Tab = 'task1' | 'task2';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('task1');

  return (
    <div className={styles.container}>
      {/* Tab Navigation */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'task1' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('task1')}
        >
          Task 1
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'task2' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('task2')}
        >
          Task 2
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'task1' && <PollingDemo />}
        {activeTab === 'task2' && <ProductGridDemo />}
      </div>
    </div>
  );
}

export default App;
