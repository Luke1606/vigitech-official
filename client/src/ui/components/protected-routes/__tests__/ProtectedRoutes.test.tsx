import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoutes } from '../ProtectedRoutes.component';
import { useUser } from '@clerk/clerk-react';

jest.mock('@clerk/clerk-react', () => ({
  useUser: jest.fn(),
  RedirectToSignIn: jest.fn(() => <div data-testid="redirect-to-sign-in">RedirectToSignIn</div>),
}));

jest.mock('react-router-dom', () => ({
  Outlet: jest.fn(() => <div data-testid="outlet">Outlet</div>),
}));

describe('ProtectedRoutes', () => {
  it('should render loading state', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoaded: false });
    render(<ProtectedRoutes />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should render Outlet when signed in', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    render(<ProtectedRoutes />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should render RedirectToSignIn when not signed in', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });
    render(<ProtectedRoutes />);
    expect(screen.getByTestId('redirect-to-sign-in')).toBeInTheDocument();
  });
});
