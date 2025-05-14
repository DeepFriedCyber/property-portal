/** @type {import('jest').Config} */
const config = {
  // Using babel-jest instead of ts-jest
  // preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@components/(.*)$': '<rootDir>/apps/web/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@your-org/ui(.*)$': '<rootDir>/packages/ui$1',
    '^@your-org/db(.*)$': '<rootDir>/packages/db/src$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/.turbo/',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { 
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: ['@babel/plugin-transform-runtime']
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'apps/web/src/**/*.{js,jsx,ts,tsx}',
    'apps/web/components/**/*.{js,jsx,ts,tsx}',
    'apps/web/app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  projects: [
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'api',
      testMatch: ['<rootDir>/apps/api/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'node',
    },
    {
      displayName: 'lib',
      testMatch: ['<rootDir>/lib/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'node',
    },
  ],
};

module.exports = config;