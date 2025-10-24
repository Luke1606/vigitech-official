import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test child</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test child')).toBeInTheDocument();
  });

  it('should render error message when an error is thrown', () => {
    // Suppress console.error output for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should render network error message when HTTP error is thrown', () => {
    const ThrowHttpError = () => {
        throw new Error('HTTP Error: 500');
    };
    // Suppress console.error output for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowHttpError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error de red')).toBeInTheDocument();
    expect(screen.getByText('HTTP Error: 500')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
