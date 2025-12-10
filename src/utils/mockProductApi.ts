import type { Product } from '../types/product';

/**
 * Mock product data generators
 * These functions simulate API endpoints returning product data with artificial latency
 */

const widgetNames = [
  'Turbo Widget Pro',
  'Ultimate Widget X',
  'Smart Widget Elite',
  'Premium Widget Plus',
  'Mega Widget Max',
  'Super Widget Deluxe',
  'Advanced Widget 3000',
  'Classic Widget SE',
];

const gadgetNames = [
  'Digital Gadget Pro',
  'Tech Gadget Ultra',
  'Quantum Gadget X',
  'Nano Gadget Elite',
  'Hyper Gadget Plus',
  'Cyber Gadget Max',
  'Future Gadget 2024',
  'Smart Gadget Hub',
];

const featuredNames = [
  'Featured Item Alpha',
  'Featured Item Beta',
  'Featured Item Gamma',
  'Featured Item Delta',
  'Featured Item Epsilon',
  'Featured Item Zeta',
];

const descriptions = [
  'High-quality product with exceptional features',
  'Best-in-class performance and reliability',
  'Industry-leading design and functionality',
  'Premium quality at an affordable price',
  'Innovative solution for modern needs',
  'Trusted by professionals worldwide',
];

/**
 * Generates random product data for a given category
 */
function generateProducts(names: string[], count: number): Product[] {
  return Array.from({ length: count }, (_, index) => ({
    id: Math.floor(Math.random() * 10000),
    name: names[index % names.length],
    price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
  }));
}

/**
 * Mock API endpoints configuration
 * Each endpoint simulates a different product category with varying latency
 */
const mockApiEndpoints: Record<string, () => Promise<Response>> = {
  '/api/products/widgets': async () => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const data: Product[] = generateProducts(widgetNames, 6);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  
  '/api/products/gadgets': async () => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const data: Product[] = generateProducts(gadgetNames, 4);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  
  '/api/products/featured': async () => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const data: Product[] = generateProducts(featuredNames, 3);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

/**
 * Initialize mock API interceptor
 * This function intercepts fetch calls and routes mock endpoints to our handlers
 * Real API calls pass through to the original fetch implementation
 */
export function initializeMockProductApi(): void {
  const originalFetch = window.fetch;
  
  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Check if this is a mock endpoint
    if (url in mockApiEndpoints) {
      return mockApiEndpoints[url]();
    }
    
    // Pass through to real fetch for non-mock endpoints
    return originalFetch(input, init);
  };
}

