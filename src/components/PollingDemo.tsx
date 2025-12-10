import { useState } from 'react';
import { usePollingFetch } from '../hooks/usePollingFetch';
import styles from './PollingDemo.module.css';

interface Post {
  id: number;
  title: string;
  body: string;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  timestamp: string;
}

const mockApiEndpoints: Record<string, () => Promise<Response>> = {
  '/api/posts': async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const data: Post = {
      id: Math.floor(Math.random() * 1000),
      title: 'Sample Post Title',
      body: 'This is a sample post body with some content.',
      timestamp: new Date().toLocaleTimeString(),
    };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  '/api/users': async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const data: User = {
      id: Math.floor(Math.random() * 100),
      name: `User ${Math.floor(Math.random() * 100)}`,
      email: `user${Math.floor(Math.random() * 100)}@example.com`,
      timestamp: new Date().toLocaleTimeString(),
    };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  '/api/error': async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};

const originalFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  if (url in mockApiEndpoints) {
    return mockApiEndpoints[url]();
  }
  
  return originalFetch(input, init);
};

export function PollingDemo() {
  const [endpoint, setEndpoint] = useState<string>('/api/posts');
  const [pollingInterval, setPollingInterval] = useState<number | undefined>(undefined);

  const { data, isLoading, error } = usePollingFetch<Post | User>(endpoint, pollingInterval);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>usePollingFetch Hook Demo</h1>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <h3 className={styles.subtitle}>Select Endpoint:</h3>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${endpoint === '/api/posts' ? styles.buttonActive : ''}`}
              onClick={() => setEndpoint('/api/posts')}
            >
              Posts API
            </button>
            <button
              className={`${styles.button} ${endpoint === '/api/users' ? styles.buttonActive : ''}`}
              onClick={() => setEndpoint('/api/users')}
            >
              Users API
            </button>
            <button
              className={`${styles.button} ${endpoint === '/api/error' ? styles.buttonActive : ''}`}
              onClick={() => setEndpoint('/api/error')}
            >
              Error API
            </button>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <h3 className={styles.subtitle}>Polling Interval:</h3>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${pollingInterval === undefined ? styles.buttonActive : ''}`}
              onClick={() => setPollingInterval(undefined)}
            >
              No Polling
            </button>
            <button
              className={`${styles.button} ${pollingInterval === 3000 ? styles.buttonActive : ''}`}
              onClick={() => setPollingInterval(3000)}
            >
              Poll Every 3s
            </button>
            <button
              className={`${styles.button} ${pollingInterval === 5000 ? styles.buttonActive : ''}`}
              onClick={() => setPollingInterval(5000)}
            >
              Poll Every 5s
            </button>
          </div>
        </div>
      </div>

      <div className={styles.status}>
        <div className={styles.statusItem}>
          <strong>Current Endpoint:</strong> {endpoint}
        </div>
        <div className={styles.statusItem}>
          <strong>Polling:</strong>{' '}
          {pollingInterval ? `Every ${pollingInterval / 1000}s` : 'Disabled'}
        </div>
        <div className={styles.statusItem}>
          <strong>Loading:</strong>{' '}
          <span style={{ color: isLoading ? '#f59e0b' : '#10b981' }}>
            {isLoading ? 'Yes' : 'No'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <strong>Error:</strong>{' '}
          <span style={{ color: error ? '#ef4444' : '#10b981' }}>
            {error ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <div className={styles.dataContainer}>
        <h3 className={styles.subtitle}>Response Data:</h3>
        {isLoading && !data && (
          <div className={styles.loadingState}>Loading initial data...</div>
        )}
        {error && (
          <div className={styles.errorState}>
            Error occurred while fetching data. Please try a different endpoint.
          </div>
        )}
        {data && !error && (
          <pre className={styles.dataDisplay}>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}


