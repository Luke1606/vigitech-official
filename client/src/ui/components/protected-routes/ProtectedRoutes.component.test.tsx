import { render, screen } from '@testing-library/react';
import { ProtectedRoutes } from './ProtectedRoutes.component';
import * as clerkReact from '@clerk/clerk-react';

// Mock react-router-dom Outlet
jest.mock('react-router-dom', () => ({
    Outlet: jest.fn(() => <div data-testid="outlet" />),
}));

// Mock Clerk
jest.mock('@clerk/clerk-react', () => ({
    useUser: jest.fn(),
    RedirectToSignIn: jest.fn(() => <div data-testid="redirect-to-signin" />),
}));

describe('ProtectedRoutes', () => {
    const mockUseUser = clerkReact.useUser as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('muestra loading mientras no está cargado', () => {
        mockUseUser.mockReturnValue({
            isLoaded: false,
            isSignedIn: false,
        });

        render(<ProtectedRoutes />);
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
        expect(screen.queryByTestId('redirect-to-signin')).not.toBeInTheDocument();
    });

    test('renderiza Outlet cuando está autenticado y cargado', () => {
        mockUseUser.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
        });

        render(<ProtectedRoutes />);
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
        expect(screen.queryByTestId('redirect-to-signin')).not.toBeInTheDocument();
    });

    test('redirige a sign-in cuando no está autenticado y cargado', () => {
        mockUseUser.mockReturnValue({
            isLoaded: true,
            isSignedIn: false,
        });

        render(<ProtectedRoutes />);
        expect(screen.getByTestId('redirect-to-signin')).toBeInTheDocument();
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
        expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    });
});