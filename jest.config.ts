import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Only measure coverage on the reliably-testable pure modules
  collectCoverageFrom: [
    'src/lib/logic.ts',
    'src/lib/carbonData.ts',
    'src/components/PlantVisual.tsx',
    'src/components/QuickLog.tsx',
    'src/components/Navigation.tsx',
    'src/components/EcoChat.tsx',
    'src/components/ErrorBoundary.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
}
 
export default createJestConfig(config)
