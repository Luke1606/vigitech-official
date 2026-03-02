import { render, screen } from '@testing-library/react';
import { Layout } from './Layout.component';
import { PathOption } from '../../../infrastructure';
import * as reactRouterDom from 'react-router-dom';

jest.mock('redux-persist', () => ({
    persistReducer: (reducer: any) => reducer,
    persistStore: () => ({}),
}));
jest.mock('redux-persist/es/persistReducer', () => (reducer: any) => reducer);
jest.mock('redux-persist/lib/storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

jest.mock('../../../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    Outlet: jest.fn(() => <div data-testid="outlet" />),
    useLocation: jest.fn(),
}));

// Mock Header and Footer to avoid testing their internals
jest.mock('./header', () => ({
    Header: () => <header data-testid="header" />,
}));

jest.mock('./footer', () => ({
    Footer: () => <footer data-testid="footer" />,
}));

describe('Layout', () => {
    const mockUseLocation = reactRouterDom.useLocation as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderLayout = (path: PathOption) => {
        mockUseLocation.mockReturnValue({ pathname: path });
        return render(<Layout />);
    };

    test('renders Header and Outlet for any path', () => {
        renderLayout(PathOption.VIGITECH_PORTAL_HOME);

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    test('renders Footer for paths not in the hide list', () => {
        const pathsThatShowFooter: PathOption[] = [
            PathOption.VIGITECH_PORTAL_HOME,
            PathOption.VIGITECH_PORTAL_FAQ,
            PathOption.VIGITECH_PORTAL_ABOUT,
            PathOption.TECHNOLOGY_RADAR_PORTAL,
            // Add any other paths that should show footer
        ];

        pathsThatShowFooter.forEach(path => {
            const { unmount } = renderLayout(path);
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            unmount();
        });
    });

    test('hides Footer for TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED', () => {
        renderLayout(PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED);
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    });

    test('hides Footer for TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR', () => {
        renderLayout(PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR);
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    });

    test('main element contains Outlet', () => {
        renderLayout(PathOption.VIGITECH_PORTAL_HOME);
        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByTestId('outlet'));
    });
});