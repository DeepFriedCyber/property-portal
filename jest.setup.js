// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock fetch
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://test:test@localhost:5432/test_db',
};

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: React.createElement') ||
      args[0].includes('Error: Uncaught [Error: expected'))
  ) {
    return;
  }
  originalConsoleError(...args);
};