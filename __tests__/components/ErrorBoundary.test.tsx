import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// A helper component that throws an error on render
const BuggyComponent = () => {
  throw new Error('Test boundary error');
};

describe('ErrorBoundary', () => {
  // Suppress expected console.error output during tests
  let originalError: typeof console.error;
  beforeAll(() => {
    originalError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('renders default fallback when an error is caught', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('renders custom fallback when provided and an error is caught', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error Fallback</div>}>
        <BuggyComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
