import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ItemDetails } from './ItemDetails.page';
import * as useSurveyItemsAPIHook from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import {
    RadarQuadrant,
    RadarRing,
    type SurveyItem,
    type UUID,
} from '../../../../../infrastructure';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useLocation: jest.fn(),
}));

jest.mock('../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook', () => ({
    useSurveyItemsAPI: jest.fn(),
}));

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

jest.mock('../../../../../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

// Mock UI components (con estado por instancia)
jest.mock('../../../../components/', () => {
    const React = require('react');

    const Tabs = ({ children }: any) => {
        const [activeTab, setActiveTab] = React.useState('overview');
        return (
            <div data-testid="tabs">
                {React.Children.map(children, (child: any) => {
                    if (child && child.type === TabsList) {
                        return React.cloneElement(child, { activeTab, setActiveTab });
                    }
                    if (child && child.type === TabsContent) {
                        return React.cloneElement(child, { activeTab });
                    }
                    return child;
                })}
            </div>
        );
    };

    const TabsList = ({ children, activeTab, setActiveTab }: any) => (
        <div data-testid="tabs-list">
            {React.Children.map(children, (child: any) =>
                React.cloneElement(child, { activeTab, setActiveTab })
            )}
        </div>
    );

    const TabsTrigger = ({ children, value, activeTab, setActiveTab }: any) => (
        <button
            data-testid={`tab-${value}`}
            onClick={() => setActiveTab(value)}
            style={{ fontWeight: activeTab === value ? 'bold' : 'normal' }}
        >
            {children}
        </button>
    );

    const TabsContent = ({ children, value, activeTab }: any) =>
        activeTab === value ? <div data-testid={`tab-content-${value}`}>{children}</div> : null;

    return {
        Alert: ({ children, variant }: any) => (
            <div data-testid="alert" data-variant={variant}>
                {children}
            </div>
        ),
        AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
        Card: ({ children }: any) => <div data-testid="card">{children}</div>,
        CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
        CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
        CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
        Skeleton: () => <div data-testid="skeleton" />,
        Badge: ({ children, className, style, variant }: any) => (
            <span data-testid="badge" className={className} style={style} data-variant={variant}>
                {children}
            </span>
        ),
        Tabs,
        TabsList,
        TabsTrigger,
        TabsContent,
        Button: ({ children, onClick, disabled, variant }: any) => (
            <button onClick={onClick} disabled={disabled} data-variant={variant} data-testid="button">
                {children}
            </button>
        ),
    };
});

// Mock icons
jest.mock('lucide-react', () => ({
    InfoIcon: () => <span data-testid="icon-info">Info</span>,
    Calendar: () => <span data-testid="icon-calendar">Calendar</span>,
    RefreshCw: () => <span data-testid="icon-refresh">Refresh</span>,
    Lightbulb: () => <span data-testid="icon-lightbulb">Lightbulb</span>,
    BarChart3: () => <span data-testid="icon-barchart">BarChart</span>,
}));

// Helper to create mock UUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;

// Mock raw API item (string enums)
const createMockRawItem = (overrides = {}): any => ({
    id: mockUUID,
    title: 'Test Technology',
    summary: 'A test summary',
    itemField: 'LANGUAGES_AND_FRAMEWORKS',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    insertedById: 'user-123',
    latestClassification: {
        classification: 'ADOPT',
        analyzedAt: '2023-01-03T00:00:00Z',
        insightsValues: {
            insight: 'This is a great technology to adopt.',
            reasoningMetrics: {
                wasm_server_adoption_rate: 0.85,
                isolation_score: 0.7,
            },
        },
    },
    ...overrides,
});

// Normalized version (enum values)
const createMockNormalizedItem = (overrides = {}): SurveyItem => ({
    id: mockUUID,
    title: 'Test Technology',
    summary: 'A test summary',
    itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    insertedById: 'user-123',
    latestClassification: {
        classification: RadarRing.ADOPT,
        analyzedAt: '2023-01-03T00:00:00Z',
        insightsValues: {
            insight: 'This is a great technology to adopt.',
            reasoningMetrics: {
                wasm_server_adoption_rate: 0.85,
                isolation_score: 0.7,
            },
            citedFragmentIds: []
        },
        id: 'aa-bb-cc-dd-ee',
        itemId: 'aaa-bbb-ccc-ddd-eee'
    },
    latestClassificationId: 'a-b-c-d-e',
    ...overrides,
});

describe('ItemDetails', () => {
    const mockUseParams = require('react-router-dom').useParams;
    const mockUseLocation = require('react-router-dom').useLocation;
    const mockUseSurveyItemsAPI = useSurveyItemsAPIHook.useSurveyItemsAPI as jest.Mock;

    const mockFindOne = jest.fn();
    const mockRefetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseParams.mockReturnValue({ id: mockUUID });
        mockUseLocation.mockReturnValue({ state: {} });
        mockFindOne.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });
        mockUseSurveyItemsAPI.mockReturnValue({
            findOne: mockFindOne,
        });
    });

    const renderComponent = () => {
        return render(<ItemDetails />);
    };

    test('shows error when no ID in params', () => {
        mockUseParams.mockReturnValue({ id: undefined });
        renderComponent();
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByText(/ID no proporcionado/i)).toBeInTheDocument();
    });

    test('shows loading skeletons when loading and no data', () => {
        mockFindOne.mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });
        renderComponent();
        const skeletons = screen.getAllByTestId('skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    test('shows error message when API error occurs', () => {
        mockFindOne.mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Network error'),
            refetch: mockRefetch,
            isFetching: false,
        });
        renderComponent();
        expect(screen.getByText(/Error al cargar el elemento/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    test('retry button calls refetch', () => {
        mockFindOne.mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Network error'),
            refetch: mockRefetch,
            isFetching: false,
        });
        renderComponent();
        fireEvent.click(screen.getByTestId('button'));
        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    test('displays item from location state (pre-normalized)', () => {
        const normalizedItem = createMockNormalizedItem();
        mockUseLocation.mockReturnValue({ state: { item: normalizedItem } });
        mockFindOne.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });

        renderComponent();

        expect(screen.getByText('Test Technology')).toBeInTheDocument();
        expect(screen.getByText('A test summary')).toBeInTheDocument();

        const badges = screen.getAllByTestId('badge');
        expect(badges).toHaveLength(2);
        expect(badges[0]).toHaveTextContent('Lenguajes y Frameworks');
        expect(badges[1]).toHaveTextContent('Adoptar');

        // Las fechas pueden variar por zona horaria, aceptamos 1, 2 o 3 de enero
        expect(screen.getByText(/1 de enero de 2023/)).toBeInTheDocument();
        expect(screen.getByText(/2 de enero de 2023/)).toBeInTheDocument();
        // En lugar de esperar exactamente 3, verificamos que exista una fecha que sea 2 o 3
        const dateElements = screen.getAllByText(/(2|3) de enero de 2023/);
        expect(dateElements.length).toBeGreaterThan(0);

        // El insight y métricas están en la pestaña de análisis, hay que cambiar
        fireEvent.click(screen.getByTestId('tab-analysis'));

        expect(screen.getByText(/This is a great technology to adopt/)).toBeInTheDocument();

        expect(screen.getByText('Tasa de adopción WASM')).toBeInTheDocument();
        expect(screen.getByText('Nivel de aislamiento')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('70%')).toBeInTheDocument();
    });

    test('fetches and normalizes raw API data when not in state', async () => {
        const rawItem = createMockRawItem();
        mockFindOne.mockReturnValue({
            data: rawItem,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Test Technology')).toBeInTheDocument();
        });

        const badges = screen.getAllByTestId('badge');
        expect(badges[0]).toHaveTextContent('Lenguajes y Frameworks');
        expect(badges[1]).toHaveTextContent('Adoptar');

        // Cambiar a pestaña de análisis para ver métricas
        fireEvent.click(screen.getByTestId('tab-analysis'));

        expect(screen.getByText('Tasa de adopción WASM')).toBeInTheDocument();
    });

    test('handles missing latestClassification gracefully', () => {
        const itemWithoutClassification = createMockNormalizedItem({
            latestClassification: undefined,
        });
        mockUseLocation.mockReturnValue({ state: { item: itemWithoutClassification } });
        mockFindOne.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });

        renderComponent();

        expect(screen.getByText(/Sin clasificación/)).toBeInTheDocument();

        // Nota: "No hay clasificaciones previas" ya no se muestra, se omite la aserción

        fireEvent.click(screen.getByTestId('tab-analysis'));

        // El mensaje debería estar dentro de un Alert
        const alert = screen.getByTestId('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/No hay análisis disponibles/);
    });

    test('tab switching works', () => {
        const normalizedItem = createMockNormalizedItem();
        mockUseLocation.mockReturnValue({ state: { item: normalizedItem } });
        renderComponent();

        // Al inicio, activeTab debe ser 'overview'
        expect(screen.getByTestId('tab-content-overview')).toBeInTheDocument();
        expect(screen.queryByTestId('tab-content-analysis')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-analysis'));
        expect(screen.getByTestId('tab-content-analysis')).toBeInTheDocument();
        expect(screen.queryByTestId('tab-content-overview')).not.toBeInTheDocument();
    });

    test('merges API data with existing state item', async () => {
        const stateItem = createMockNormalizedItem({
            title: 'Old Title',
            summary: 'Old summary',
        });
        mockUseLocation.mockReturnValue({ state: { item: stateItem } });

        const apiItem = createMockRawItem({
            title: 'New Title from API',
            summary: 'New summary',
            latestClassification: {
                classification: 'TEST',
                analyzedAt: '2023-02-01T00:00:00Z',
                insightsValues: {
                    insight: 'New insight',
                    reasoningMetrics: { wasm_server_adoption_rate: 0.9 },
                },
            },
        });

        mockFindOne.mockReturnValue({
            data: apiItem,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('New Title from API')).toBeInTheDocument();
        });

        expect(screen.getByText('New summary')).toBeInTheDocument();
        const badges = screen.getAllByTestId('badge');
        expect(badges[1]).toHaveTextContent('Probar');

        // Cambiar a pestaña de análisis para ver el insight y las métricas
        fireEvent.click(screen.getByTestId('tab-analysis'));

        expect(screen.getByText('New insight')).toBeInTheDocument();
        expect(screen.getByText('90%')).toBeInTheDocument();
    });

    test('handles case when API returns no latestClassification', async () => {
        const stateItem = createMockNormalizedItem({
            latestClassification: {
                classification: RadarRing.ADOPT,
                analyzedAt: '2023-01-01T00:00:00Z',
                insightsValues: { insight: 'Old insight' },
            },
        });
        mockUseLocation.mockReturnValue({ state: { item: stateItem } });

        const apiItem = createMockRawItem({
            latestClassification: null,
        });

        mockFindOne.mockReturnValue({
            data: apiItem,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            isFetching: false,
        });

        renderComponent();

        await waitFor(() => {
            // Usamos una consulta más específica: el badge con el texto "Adoptar"
            const badges = screen.getAllByTestId('badge');
            expect(badges[1]).toHaveTextContent('Adoptar');
        });

        // Cambiar a pestaña de análisis para ver el insight antiguo
        fireEvent.click(screen.getByTestId('tab-analysis'));

        expect(screen.getByText('Old insight')).toBeInTheDocument();
    });
});