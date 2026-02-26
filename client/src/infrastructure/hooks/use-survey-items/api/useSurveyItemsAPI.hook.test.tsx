import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSurveyItemsAPI, SurveyItemsAPIOptions } from './useSurveyItemsAPI.hook';
import * as queryOptions from './query-options';
import * as mutationOptions from './mutation-options';
import * as runAllReclassifications from './mutation-options/runAllReclassifications.mutation';

// Mocks de dependencias
jest.mock('./query-options');
jest.mock('./mutation-options');
jest.mock('./mutation-options/runAllReclassifications.mutation');

// Mock completo de redux-persist
jest.mock('redux-persist', () => ({
    persistReducer: jest.fn((reducer) => reducer),
    persistStore: jest.fn(),
}));

jest.mock('redux-persist/es/persistReducer', () => ({
    __esModule: true,
    default: jest.fn((reducer) => reducer),
}));

jest.mock('redux-persist/lib/storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

// Definimos los mocks de las funciones de react-query antes del mock del módulo
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();

// Mock parcial de @tanstack/react-query: conservamos todas las exportaciones reales
// excepto useQuery y useMutation, que serán reemplazadas por nuestros mocks.
jest.mock('@tanstack/react-query', () => {
    const actual = jest.requireActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: (...args: any[]) => mockUseQuery(...args),
        useMutation: (...args: any[]) => mockUseMutation(...args),
    };
});

// Mock opcional del entorno (si el hook lo necesita)
jest.mock('../../../../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

describe('useSurveyItemsAPI', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Configuración por defecto de los option mocks
        (queryOptions.getRecommendedQueryOptions as jest.Mock).mockReturnValue({
            queryKey: ['recommended'],
        });
        (queryOptions.getSubscribedQueryOptions as jest.Mock).mockReturnValue({
            queryKey: ['subscribed'],
        });
        (queryOptions.findOneQueryOptions as jest.Mock).mockImplementation(
            (id: string) => ({ queryKey: ['findOne', id] })
        );

        (mutationOptions.useSubscribeOneMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['subscribeOne'],
        });
        (mutationOptions.useUnsubscribeOneMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['unsubscribeOne'],
        });
        (mutationOptions.useRemoveOneMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['removeOne'],
        });
        (mutationOptions.useUnsubscribeBatchMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['unsubscribeBatch'],
        });
        (mutationOptions.useCreateSurveyItemMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['create'],
        });
        (mutationOptions.useCreateBatchSurveyItemsMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['createBatch'],
        });
        (mutationOptions.useRunGlobalRecommendationsMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['runGlobalRecommendations'],
        });
        (runAllReclassifications.useRunAllReclassificationsMutationOptions as jest.Mock).mockReturnValue({
            mutationKey: ['runAllReclassifications'],
        });

        // Batch mutations con callbacks
        (mutationOptions.useSubscribeBatchMutationOptions as jest.Mock).mockImplementation(
            (onSuccess?: any) => ({ mutationKey: ['subscribeBatch'], onSuccess })
        );
        (mutationOptions.useRemoveBatchMutationOptions as jest.Mock).mockImplementation(
            (onSuccess?: any) => ({ mutationKey: ['removeBatch'], onSuccess })
        );

        mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null });
        mockUseMutation.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn(),
            isPending: false,
            isError: false,
        });

        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    });

    test('should return the expected API shape', () => {
        const { result } = renderHook(() => useSurveyItemsAPI(), { wrapper });

        expect(result.current).toHaveProperty('recommended');
        expect(result.current).toHaveProperty('subscribed');
        expect(result.current).toHaveProperty('findOne');
        expect(result.current).toHaveProperty('subscribeOne');
        expect(result.current).toHaveProperty('unsubscribeOne');
        expect(result.current).toHaveProperty('removeOne');
        expect(result.current).toHaveProperty('subscribeBatch');
        expect(result.current).toHaveProperty('unsubscribeBatch');
        expect(result.current).toHaveProperty('removeBatch');
        expect(result.current).toHaveProperty('create');
        expect(result.current).toHaveProperty('createBatch');
        expect(result.current).toHaveProperty('runGlobalRecommendations');
        expect(result.current).toHaveProperty('runAllReclassifications');
        expect(result.current).toHaveProperty('runGlobalRecommendationsMutation');
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('hasError');
    });

    test('should call useQuery with correct options for recommended and subscribed', () => {
        renderHook(() => useSurveyItemsAPI(), { wrapper });

        expect(queryOptions.getRecommendedQueryOptions).toHaveBeenCalledTimes(1);
        expect(mockUseQuery).toHaveBeenCalledWith({ queryKey: ['recommended'] });

        expect(queryOptions.getSubscribedQueryOptions).toHaveBeenCalledTimes(1);
        expect(mockUseQuery).toHaveBeenCalledWith({ queryKey: ['subscribed'] });
    });

    test('findOne should call useQuery with correct itemId', () => {
        const { result } = renderHook(() => useSurveyItemsAPI(), { wrapper });

        const TestComponent = () => {
            result.current.findOne('123e4567-e89b-12d3-a456-426614174000');
            return null;
        };
        renderHook(() => TestComponent(), { wrapper });

        expect(queryOptions.findOneQueryOptions).toHaveBeenCalledWith(
            '123e4567-e89b-12d3-a456-426614174000'
        );
        expect(mockUseQuery).toHaveBeenCalledWith({
            queryKey: ['findOne', '123e4567-e89b-12d3-a456-426614174000'],
        });
    });

    test('should call useMutation for each mutation with correct options', () => {
        renderHook(() => useSurveyItemsAPI(), { wrapper });

        // Individual mutations
        expect(mutationOptions.useSubscribeOneMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['subscribeOne'] });

        expect(mutationOptions.useUnsubscribeOneMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['unsubscribeOne'] });

        expect(mutationOptions.useRemoveOneMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['removeOne'] });

        expect(mutationOptions.useUnsubscribeBatchMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['unsubscribeBatch'] });

        expect(mutationOptions.useCreateSurveyItemMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['create'] });

        expect(mutationOptions.useCreateBatchSurveyItemsMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['createBatch'] });

        expect(mutationOptions.useRunGlobalRecommendationsMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['runGlobalRecommendations'] });

        expect(runAllReclassifications.useRunAllReclassificationsMutationOptions).toHaveBeenCalledTimes(1);
        expect(mockUseMutation).toHaveBeenCalledWith({ mutationKey: ['runAllReclassifications'] });

        // Batch mutations with potential callbacks
        expect(mutationOptions.useSubscribeBatchMutationOptions).toHaveBeenCalledWith(undefined);
        expect(mockUseMutation).toHaveBeenCalledWith({
            mutationKey: ['subscribeBatch'],
            onSuccess: undefined,
        });

        expect(mutationOptions.useRemoveBatchMutationOptions).toHaveBeenCalledWith(undefined);
        expect(mockUseMutation).toHaveBeenCalledWith({
            mutationKey: ['removeBatch'],
            onSuccess: undefined,
        });
    });

    test('should pass callbacks to batch mutations when provided', () => {
        const onSubscribeBatchSuccess = jest.fn();
        const onRemoveBatchSuccess = jest.fn();
        const options: SurveyItemsAPIOptions = {
            onSubscribeBatchSuccess,
            onRemoveBatchSuccess,
        };

        renderHook(() => useSurveyItemsAPI(options), { wrapper });

        expect(mutationOptions.useSubscribeBatchMutationOptions).toHaveBeenCalledWith(
            onSubscribeBatchSuccess
        );
        expect(mutationOptions.useRemoveBatchMutationOptions).toHaveBeenCalledWith(
            onRemoveBatchSuccess
        );
    });

    test('should return mutate functions bound correctly', () => {
        const mockMutate = jest.fn();
        const mockMutateAsync = jest.fn();
        mockUseMutation.mockReturnValue({
            mutate: mockMutate,
            mutateAsync: mockMutateAsync,
            isPending: false,
            isError: false,
        });

        const { result } = renderHook(() => useSurveyItemsAPI(), { wrapper });

        expect(result.current.subscribeOne).toBe(mockMutate);
        expect(result.current.unsubscribeOne).toBe(mockMutate);
        expect(result.current.removeOne).toBe(mockMutate);
        expect(result.current.subscribeBatch).toBe(mockMutate);
        expect(result.current.unsubscribeBatch).toBe(mockMutate);
        expect(result.current.removeBatch).toBe(mockMutate);
        expect(result.current.create).toBe(mockMutate);
        expect(result.current.createBatch).toBe(mockMutate);
        expect(result.current.runGlobalRecommendations).toBe(mockMutate);
        expect(result.current.runAllReclassifications).toBe(mockMutateAsync);
    });

    test('should return the full mutation object for runGlobalRecommendations', () => {
        const mutationObj = { mutate: jest.fn(), isPending: false, isError: false };
        mockUseMutation.mockReturnValue(mutationObj);

        const { result } = renderHook(() => useSurveyItemsAPI(), { wrapper });

        expect(result.current.runGlobalRecommendationsMutation).toBe(mutationObj);
    });

    test('should aggregate loading states correctly', () => {
        // Orden real de las mutaciones en el hook:
        // 1. subscribeOne
        // 2. unsubscribeOne
        // 3. removeOne
        // 4. unsubscribeBatch
        // 5. createSurveyItem
        // 6. createBatchSurveyItems
        // 7. runGlobalRecommendations
        // 8. runAllReclassifications
        // 9. subscribeBatch (con callback)
        // 10. removeBatch (con callback)
        mockUseMutation
            .mockReturnValueOnce({ isPending: true, isError: false })  // subscribeOne (cargando)
            .mockReturnValueOnce({ isPending: false, isError: false }) // unsubscribeOne
            .mockReturnValueOnce({ isPending: false, isError: false }) // removeOne
            .mockReturnValueOnce({ isPending: false, isError: false }) // unsubscribeBatch
            .mockReturnValueOnce({ isPending: false, isError: false }) // createSurveyItem
            .mockReturnValueOnce({ isPending: false, isError: false }) // createBatchSurveyItems
            .mockReturnValueOnce({ isPending: false, isError: false }) // runGlobalRecommendations
            .mockReturnValueOnce({ isPending: false, isError: false }) // runAllReclassifications
            .mockReturnValueOnce({ isPending: false, isError: false }) // subscribeBatch
            .mockReturnValueOnce({ isPending: false, isError: false }); // removeBatch

        const { result } = renderHook(() => useSurveyItemsAPI(), { wrapper });

        expect(result.current.isLoading.subscribeOne).toBe(true);
        expect(result.current.isLoading.unsubscribeOne).toBe(false);
        expect(result.current.isLoading.removeOne).toBe(false);
        expect(result.current.isLoading.subscribeBatch).toBe(false);
        expect(result.current.isLoading.unsubscribeBatch).toBe(false);
        expect(result.current.isLoading.removeBatch).toBe(false);
        expect(result.current.isLoading.create).toBe(false);
        expect(result.current.isLoading.createBatch).toBe(false);
        expect(result.current.isLoading.runGlobalRecommendations).toBe(false);
        expect(result.current.isLoading.runAllReclassifications).toBe(false);
    });

    test('should aggregate error states correctly', () => {
        mockUseMutation
            .mockReturnValueOnce({ isPending: false, isError: false }) // subscribeOne
            .mockReturnValueOnce({ isPending: false, isError: true }) // unsubscribeOne
            .mockReturnValueOnce({ isPending: false, isError: false }) // removeOne
            .mockReturnValueOnce({ isPending: false, isError: false }) // subscribeBatch
            .mockReturnValueOnce({ isPending: false, isError: false }) // unsubscribeBatch
            .mockReturnValueOnce({ isPending: false, isError: true }) // removeBatch
            .mockReturnValueOnce({ isPending: false, isError: false }) // create
            .mockReturnValueOnce({ isPending: false, isError: false }) // createBatch
            .mockReturnValueOnce({ isPending: false, isError: false }) // runGlobalRecommendations
            .mockReturnValueOnce({ isPending: false, isError: false }); // runAllReclassifications

        const { result } = renderHook(() => useSurveyItemsAPI(), { wrapper });

        expect(result.current.hasError.subscribeOne).toBe(false);
        expect(result.current.hasError.unsubscribeOne).toBe(true);
        expect(result.current.hasError.removeOne).toBe(false);
        expect(result.current.hasError.subscribeBatch).toBe(false);
        expect(result.current.hasError.unsubscribeBatch).toBe(false);
        expect(result.current.hasError.removeBatch).toBe(false);
        expect(result.current.hasError.create).toBe(false);
        expect(result.current.hasError.createBatch).toBe(true);
        expect(result.current.hasError.runGlobalRecommendations).toBe(false);
        expect(result.current.hasError.runAllReclassifications).toBe(false);
    });
});