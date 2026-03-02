import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RecommendationsFeed } from './RecommendationsFeed.page';
import { BrowserRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import { PathOption, type SurveyItem } from '../../../../../infrastructure';

// Mocks
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

jest.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useNavigate: jest.fn(),
}));

jest.mock('../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook', () => ({
    useSurveyItemsAPI: jest.fn(),
}));

jest.mock('../../../../components', () => ({
    Button: ({ children, onClick, disabled, className, variant, size }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={className}
            data-variant={variant}
            data-size={size}
            data-testid="mock-button"
        >
            {children}
        </button>
    ),
    SurveyItemCard: ({ item, selected, onSelect, onUnselect, onSubscribeOne, onRemoveOne, onViewDetails }: any) => (
        <div data-testid={`survey-item-card-${item.id}`} data-selected={selected}>
            <span>{item.title}</span>
            <button onClick={() => (selected ? onUnselect() : onSelect())} data-testid={`select-btn-${item.id}`}>
                {selected ? 'Unselect' : 'Select'}
            </button>
            <button onClick={onSubscribeOne} data-testid={`subscribe-one-${item.id}`}>Subscribe</button>
            <button onClick={onRemoveOne} data-testid={`remove-one-${item.id}`}>Remove</button>
            <button onClick={onViewDetails} data-testid={`view-details-${item.id}`}>View</button>
        </div>
    ),
}));

jest.mock('lucide-react', () => ({
    Loader2: () => <span data-testid="loader">Loader</span>,
    ChevronLeft: () => <span data-testid="chevron-left">Left</span>,
    ChevronRight: () => <span data-testid="chevron-right">Right</span>,
    RotateCw: () => <span data-testid="rotate">Rotate</span>,
}));

// Helper to create mock survey items
const createMockItem = (id: string, title: string): SurveyItem => ({
    id,
    title,
    itemField: 'LANGUAGES_AND_FRAMEWORKS',
    latestClassification: { classification: 'ADOPT' },
} as unknown as SurveyItem);

describe('RecommendationsFeed', () => {
    const mockNavigate = jest.fn();
    const mockSubscribeBatch = jest.fn();
    const mockRemoveBatch = jest.fn();
    const mockRunGlobalRecommendations = jest.fn();
    const mockRefetch = jest.fn();

    const mockItems: SurveyItem[] = [
        createMockItem('1', 'React'),
        createMockItem('2', 'Vue'),
        createMockItem('3', 'Angular'),
        createMockItem('4', 'Svelte'),
        createMockItem('5', 'Solid'),
        createMockItem('6', 'Qwik'),
        createMockItem('7', 'Preact'),
    ];

    const defaultHookReturn = {
        recommended: {
            data: mockItems,
            isPending: false,
            isError: false,
            refetch: mockRefetch,
        },
        isLoading: {
            subscribeBatch: false,
            removeBatch: false,
            runGlobalRecommendations: false,
            subscribeOne: false,
            removeOne: false,
        },
        subscribeBatch: mockSubscribeBatch,
        removeBatch: mockRemoveBatch,
        runGlobalRecommendations: mockRunGlobalRecommendations,
        subscribeOne: jest.fn(),
        removeOne: jest.fn(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useSurveyItemsAPI as jest.Mock).mockImplementation((options?: any) => ({
            ...defaultHookReturn,
            ...options,
        }));
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
        window.dispatchEvent(new Event('resize'));
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <RecommendationsFeed />
            </BrowserRouter>
        );
    };

    test('shows loading spinner when loading and no data', () => {
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            ...defaultHookReturn,
            recommended: { data: [], isPending: true, isError: false, refetch: mockRefetch },
        });
        renderComponent();
        expect(screen.getByText(/Cargando recomendaciones/i)).toBeInTheDocument();
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    test('shows empty state with retry button', () => {
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            ...defaultHookReturn,
            recommended: { data: [], isPending: false, isError: false, refetch: mockRefetch },
        });
        renderComponent();

        // There are two elements with similar text; pick the heading one
        expect(screen.getByRole('heading', { name: /No hay recomendaciones disponibles\./i })).toBeInTheDocument();
        const retryButton = screen.getByRole('button', { name: /Obtener nuevas recomendaciones/i });
        expect(retryButton).toBeInTheDocument();
        fireEvent.click(retryButton);
        expect(mockRunGlobalRecommendations).toHaveBeenCalledTimes(1);
    });

    test('shows error state with retry and refetch', () => {
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            ...defaultHookReturn,
            recommended: { data: [], isPending: false, isError: true, refetch: mockRefetch },
        });
        renderComponent();
        expect(screen.getByText(/Error al cargar las recomendaciones/i)).toBeInTheDocument();

        // In error state, the button still says "Obtener nuevas recomendaciones"
        const retryButton = screen.getByRole('button', { name: /Obtener nuevas recomendaciones/i });
        fireEvent.click(retryButton);
        expect(mockRunGlobalRecommendations).toHaveBeenCalledTimes(1);
        // No refetch button in this state, so mockRefetch not called
    });

    test('renders list of items correctly', () => {
        renderComponent();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Vue')).toBeInTheDocument();
        expect(screen.getByText('Angular')).toBeInTheDocument();
        expect(screen.getByText('Svelte')).toBeInTheDocument();
        expect(screen.getByText('Solid')).toBeInTheDocument();
        expect(screen.getByText('Qwik')).toBeInTheDocument();
        expect(screen.queryByText('Preact')).not.toBeInTheDocument();
        expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
        expect(screen.getByText(/1-6 de 7 elementos/)).toBeInTheDocument();
    });

    test('pagination navigation works', () => {
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
        expect(screen.getByText('Preact')).toBeInTheDocument();
        expect(screen.queryByText('React')).not.toBeInTheDocument();
        expect(screen.getByText(/Página 2 de 2/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Anterior/i }));
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.queryByText('Preact')).not.toBeInTheDocument();
    });

    test('responsive pagination: mobile shows 3 items per page', () => {
        window.innerWidth = 500;
        window.dispatchEvent(new Event('resize'));
        renderComponent();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Vue')).toBeInTheDocument();
        expect(screen.getByText('Angular')).toBeInTheDocument();
        expect(screen.queryByText('Svelte')).not.toBeInTheDocument();
        expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
    });

    test('select all / deselect all buttons work', () => {
        renderComponent();
        const selectAllButton = screen.getByRole('button', { name: /Seleccionar todos/i });
        expect(selectAllButton).toBeInTheDocument();

        mockItems.slice(0, 6).forEach(item => {
            expect(screen.getByTestId(`survey-item-card-${item.id}`)).toHaveAttribute('data-selected', 'false');
        });

        fireEvent.click(selectAllButton);
        mockItems.slice(0, 6).forEach(item => {
            expect(screen.getByTestId(`survey-item-card-${item.id}`)).toHaveAttribute('data-selected', 'true');
        });

        expect(screen.getByRole('button', { name: /Deseleccionar todos/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Deseleccionar todos/i }));
        mockItems.slice(0, 6).forEach(item => {
            expect(screen.getByTestId(`survey-item-card-${item.id}`)).toHaveAttribute('data-selected', 'false');
        });
    });

    test('individual selection via card works', () => {
        renderComponent();
        const reactCard = screen.getByTestId('survey-item-card-1');
        expect(reactCard).toHaveAttribute('data-selected', 'false');

        fireEvent.click(screen.getByTestId('select-btn-1'));
        expect(reactCard).toHaveAttribute('data-selected', 'true');

        fireEvent.click(screen.getByTestId('select-btn-1'));
        expect(reactCard).toHaveAttribute('data-selected', 'false');
    });

    test('subscribe batch calls hook and clears selected items on success', async () => {
        let capturedOnSubscribeBatchSuccess: Function | undefined;
        (useSurveyItemsAPI as jest.Mock).mockImplementation((options?: any) => {
            capturedOnSubscribeBatchSuccess = options?.onSubscribeBatchSuccess;
            return {
                ...defaultHookReturn,
                isLoading: { ...defaultHookReturn.isLoading, subscribeBatch: false },
                subscribeBatch: mockSubscribeBatch.mockImplementation((ids: string[]) => {
                    capturedOnSubscribeBatchSuccess?.(ids);
                }),
            };
        });

        renderComponent();

        fireEvent.click(screen.getByTestId('select-btn-1'));
        expect(screen.getByTestId('survey-item-card-1')).toHaveAttribute('data-selected', 'true');

        fireEvent.click(screen.getByRole('button', { name: /Suscribirse \(1\)/i }));

        expect(mockSubscribeBatch).toHaveBeenCalledWith(['1']);

        await waitFor(() => {
            expect(screen.getByTestId('survey-item-card-1')).toHaveAttribute('data-selected', 'false');
        });
    });

    test('remove batch calls hook and clears selected items on success', async () => {
        let capturedOnRemoveBatchSuccess: Function | undefined;
        (useSurveyItemsAPI as jest.Mock).mockImplementation((options?: any) => {
            capturedOnRemoveBatchSuccess = options?.onRemoveBatchSuccess;
            return {
                ...defaultHookReturn,
                isLoading: { ...defaultHookReturn.isLoading, removeBatch: false },
                removeBatch: mockRemoveBatch.mockImplementation((ids: string[]) => {
                    capturedOnRemoveBatchSuccess?.(ids);
                }),
            };
        });

        renderComponent();

        fireEvent.click(screen.getByTestId('select-btn-1'));
        fireEvent.click(screen.getByTestId('select-btn-2'));
        expect(screen.getByTestId('survey-item-card-1')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('survey-item-card-2')).toHaveAttribute('data-selected', 'true');

        fireEvent.click(screen.getByRole('button', { name: /Remover \(2\)/i }));

        expect(mockRemoveBatch).toHaveBeenCalledWith(['1', '2']);

        await waitFor(() => {
            expect(screen.getByTestId('survey-item-card-1')).toHaveAttribute('data-selected', 'false');
            expect(screen.getByTestId('survey-item-card-2')).toHaveAttribute('data-selected', 'false');
        });
    });

    test('update recommendations button calls runGlobalRecommendations', () => {
        renderComponent();
        const updateButton = screen.getByRole('button', { name: /Actualizar recomendaciones/i });
        fireEvent.click(updateButton);
        expect(mockRunGlobalRecommendations).toHaveBeenCalledTimes(1);
    });

    test('navigation to details via card', () => {
        renderComponent();
        fireEvent.click(screen.getByTestId('view-details-1'));
        expect(mockNavigate).toHaveBeenCalledWith(
            `${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/1`,
            { state: { item: expect.objectContaining({ id: '1', title: 'React' }) } }
        );
    });

    test('navigation to radar via "aquí" link in empty state', () => {
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            ...defaultHookReturn,
            recommended: { data: [], isPending: false, isError: false, refetch: mockRefetch },
        });
        renderComponent();
        const aquiLink = screen.getByText(/aquí/i);
        fireEvent.click(aquiLink);
        expect(mockNavigate).toHaveBeenCalledWith(PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR);
    });

    test('disables buttons while loading', () => {
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            ...defaultHookReturn,
            isLoading: {
                subscribeBatch: true,
                removeBatch: true,
                runGlobalRecommendations: true,
                subscribeOne: false,
                removeOne: false,
            },
        });
        renderComponent();

        // Subscribe batch button should show loading text and be disabled
        const subscribeButton = screen.getByRole('button', { name: /Suscribiendo.../i });
        expect(subscribeButton).toBeDisabled();

        // Remove batch button should show loading text and be disabled
        const removeButton = screen.getByRole('button', { name: /Removiendo.../i });
        expect(removeButton).toBeDisabled();

        // Update button disabled and contains a loader
        const updateButton = screen.getByRole('button', { name: /Generando.../i });
        expect(updateButton).toBeDisabled();
        expect(within(updateButton).getByTestId('loader')).toBeInTheDocument();
    });

    test('single subscribe and remove via card call appropriate functions', () => {
        const mockSubscribeOne = jest.fn();
        const mockRemoveOne = jest.fn();
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            ...defaultHookReturn,
            subscribeOne: mockSubscribeOne,
            removeOne: mockRemoveOne,
            isLoading: { ...defaultHookReturn.isLoading, subscribeOne: false, removeOne: false },
        });

        renderComponent();

        fireEvent.click(screen.getByTestId('subscribe-one-1'));
        expect(mockSubscribeOne).toHaveBeenCalledWith('1', { onSuccess: expect.any(Function) });

        fireEvent.click(screen.getByTestId('remove-one-1'));
        expect(mockRemoveOne).toHaveBeenCalledWith('1', { onSuccess: expect.any(Function) });
    });
});