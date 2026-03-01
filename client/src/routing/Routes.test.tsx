/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './Routes';

// Mock redux-persist and env
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

jest.mock('../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

// Mock all page components
jest.mock('../ui/pages', () => ({
    PortalHome: () => <div data-testid="portal-home" />,
    FAQ: () => <div data-testid="faq" />,
    About: () => <div data-testid="about" />,
    TechnologyRadarHome: () => <div data-testid="technology-radar-home" />,
    RecommendationsFeed: () => <div data-testid="recommendations-feed" />,
    SubscribedItemsRadar: () => <div data-testid="subscribed-items-radar" />,
    ItemDetails: () => <div data-testid="item-details" />,
}));

// Mock layout components with proper Outlet usage
jest.mock('../ui/components', () => {
    let isAuthenticated = true;
    const { Outlet } = require('react-router-dom');
    return {
        Layout: () => (
            <div data-testid="layout">
                <div data-testid="mock-header" />
                <Outlet />
                <div data-testid="mock-footer" />
            </div>
        ),
        Error: ({ errorTitle, errorDescription }: any) => (
            <div data-testid="error">
                <h1>{errorTitle}</h1>
                <p>{errorDescription}</p>
            </div>
        ),
        ProtectedRoutes: () =>
            isAuthenticated ? <Outlet /> : <div data-testid="redirect-to-signin" />,
        __setAuthenticated: (value: boolean) => { isAuthenticated = value; }
    };
});

const { __setAuthenticated } = jest.requireMock('../ui/components');

describe('Routes configuration', () => {
    const renderWithPath = (path: string) => {
        const router = createMemoryRouter(routes, { initialEntries: [path] });
        render(<RouterProvider router={router} />);
    };

    beforeEach(() => {
        __setAuthenticated(true);
    });

    test('redirects root "/" to Vigitech portal home', () => {
        renderWithPath('/');
        expect(screen.getByTestId('portal-home')).toBeInTheDocument();
    });

    test('redirects "/vigitech" to Vigitech portal home', () => {
        renderWithPath('/vigitech');
        expect(screen.getByTestId('portal-home')).toBeInTheDocument();
    });

    test('renders PortalHome at /vigitech/portal', () => {
        renderWithPath('/vigitech/portal');
        expect(screen.getByTestId('portal-home')).toBeInTheDocument();
    });

    test('renders FAQ at /vigitech/portal/faq', () => {
        renderWithPath('/vigitech/portal/faq');
        expect(screen.getByTestId('faq')).toBeInTheDocument();
    });

    test('renders About at /vigitech/portal/about', () => {
        renderWithPath('/vigitech/portal/about');
        expect(screen.getByTestId('about')).toBeInTheDocument();
    });

    test('renders TechnologyRadarHome at /vigitech/technology-radar', () => {
        renderWithPath('/vigitech/technology-radar');
        expect(screen.getByTestId('technology-radar-home')).toBeInTheDocument();
    });

    describe('protected routes', () => {
        test('renders RecommendationsFeed when authenticated', () => {
            __setAuthenticated(true);
            renderWithPath('/vigitech/technology-radar/recommendations-feed');
            expect(screen.getByTestId('recommendations-feed')).toBeInTheDocument();
            expect(screen.queryByTestId('redirect-to-signin')).not.toBeInTheDocument();
        });

        test('redirects to sign-in for RecommendationsFeed when not authenticated', () => {
            __setAuthenticated(false);
            renderWithPath('/vigitech/technology-radar/recommendations-feed');
            expect(screen.getByTestId('redirect-to-signin')).toBeInTheDocument();
            expect(screen.queryByTestId('recommendations-feed')).not.toBeInTheDocument();
        });

        test('renders SubscribedItemsRadar when authenticated', () => {
            __setAuthenticated(true);
            renderWithPath('/vigitech/technology-radar/subscribed-items-radar');
            expect(screen.getByTestId('subscribed-items-radar')).toBeInTheDocument();
        });

        test('redirects to sign-in for SubscribedItemsRadar when not authenticated', () => {
            __setAuthenticated(false);
            renderWithPath('/vigitech/technology-radar/subscribed-items-radar');
            expect(screen.getByTestId('redirect-to-signin')).toBeInTheDocument();
        });

        test('renders ItemDetails when authenticated', () => {
            __setAuthenticated(true);
            renderWithPath('/vigitech/technology-radar/item-details/123');
            expect(screen.getByTestId('item-details')).toBeInTheDocument();
        });

        test('redirects to sign-in for ItemDetails when not authenticated', () => {
            __setAuthenticated(false);
            renderWithPath('/vigitech/technology-radar/item-details/123');
            expect(screen.getByTestId('redirect-to-signin')).toBeInTheDocument();
        });
    });

    test('renders Error component for unknown routes', () => {
        renderWithPath('/some/non-existent/route');
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.getByText('Dirección no encontrada')).toBeInTheDocument();
        expect(screen.getByText('La ruta especificada no corresponde a ninguna dirección. Verifique la ruta.')).toBeInTheDocument();
    });
});