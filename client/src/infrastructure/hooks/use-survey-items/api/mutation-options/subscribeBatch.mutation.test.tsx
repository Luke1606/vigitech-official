import type { UUID } from 'crypto';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useSubscribeBatchMutationOptions } from './subscribeBatch.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, recommendedKey, subscribedKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        subscribeBatch: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Helper para UUIDs falsos
const mockUUID = (id: number): UUID => `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}` as UUID;

// Tipo mínimo para pruebas
interface TestSurveyItem {
    id: UUID;
    title?: string;
}

describe('useSubscribeBatchMutationOptions', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        jest.clearAllMocks();
        queryClient.clear();
    });

    test('should return mutation options with expected properties', () => {
        const { result } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onMutate');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    describe('mutationFn', () => {
        test('should call surveyItemsRepository.subscribeBatch with the provided UUIDs', async () => {
            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1), mockUUID(2)];
            (surveyItemsRepository.subscribeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(surveyItemsRepository.subscribeBatch).toHaveBeenCalledTimes(1);
            expect(surveyItemsRepository.subscribeBatch).toHaveBeenCalledWith(itemIds);
        });
    });

    describe('onMutate', () => {
        const mutationContext = { client: queryClient, meta: undefined };

        test('should cancel ongoing queries, capture previous data, and optimistically update both lists', async () => {
            // Datos iniciales
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            const item3: TestSurveyItem = { id: mockUUID(3) };

            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2, item3]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item2]);

            const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

            const { result } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1), mockUUID(3)];
            const context = await result.current.onMutate!(itemIds, mutationContext);

            // Verificar cancelaciones
            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });

            // Verificar contexto retornado
            expect(context).toEqual({
                previousRecommendations: [item1, item2, item3],
                previousSubscribed: [item2],
            });

            // Verificar actualización optimista
            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(updatedRecommended).toEqual([item2]); // item1 y item3 eliminados
            expect(updatedSubscribed).toEqual([item2, item1, item3]); // se agregaron item1 y item3 (orden puede variar, usamos toEqual con orden)
            // Como el orden no está garantizado, podemos verificar contenido
            expect(updatedSubscribed).toHaveLength(3);
            expect(updatedSubscribed).toContainEqual(item1);
            expect(updatedSubscribed).toContainEqual(item2);
            expect(updatedSubscribed).toContainEqual(item3);
        });

        test('should handle case when recommended list is undefined', async () => {
            // recommended no tiene datos, subscribed tiene algunos
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item2]);

            const { result } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1), mockUUID(3)];
            const context = await result.current.onMutate!(itemIds, mutationContext);

            expect(context).toEqual({
                previousRecommendations: undefined,
                previousSubscribed: [item2],
            });

            // recommended: old undefined => filter devuelve []
            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([]);

            // subscribed: se agregan los items? itemsToAdd se obtiene de previousRecommendations, que es undefined, entonces no se agrega nada.
            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([item2]); // sin cambios
        });

        test('should handle case when subscribed list is undefined', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);

            const { result } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            const context = await result.current.onMutate!(itemIds, mutationContext);

            expect(context).toEqual({
                previousRecommendations: [item1, item2],
                previousSubscribed: undefined,
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([item2]);

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([item1]); // se crea nueva lista
        });

        test('should handle case when no items to add (ids not in recommended)', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], []);

            const { result } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(3)]; // no existe en recommended
            const context = await result.current.onMutate!(itemIds, mutationContext);

            expect(context).toEqual({
                previousRecommendations: [item1, item2],
                previousSubscribed: [],
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([item1, item2]); // sin cambios porque no había ids coincidentes

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([]); // sin cambios
        });
    });

    describe('onSuccess', () => {
        test('should invalidate queries, show success toast, and call cleanup callback with variables', async () => {
            const onSuccessCleanup = jest.fn();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useSubscribeBatchMutationOptions(onSuccessCleanup),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1), mockUUID(2)];
            (surveyItemsRepository.subscribeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
            expect(toast.success).toHaveBeenCalledWith('Se suscribió con éxito a los elementos.');
            expect(onSuccessCleanup).toHaveBeenCalledWith(itemIds);
        });

        test('should not call cleanup callback if not provided', async () => {
            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1)];
            (surveyItemsRepository.subscribeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(toast.success).toHaveBeenCalled();
        });
    });

    describe('onError', () => {
        const mutationContext = { client: queryClient, meta: undefined };

        test('should rollback to previous data and show error toast', async () => {
            // Datos iniciales
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item2]);

            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            const context = await optionsResult.current.onMutate!(itemIds, mutationContext);

            // Simular error
            optionsResult.current.onError!(new Error('Network error'), itemIds, context, mutationContext);

            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const restoredSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(restoredRecommended).toEqual([item1, item2]);
            expect(restoredSubscribed).toEqual([item2]);

            expect(toast.error).toHaveBeenCalledWith('Error al suscribirse a los elementos seleccionados.');
        });

        test('should handle case where context is undefined (no optimistic update)', () => {
            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            optionsResult.current.onError!(new Error('Network error'), itemIds, undefined, mutationContext);

            const recommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(recommended).toBeUndefined();

            expect(toast.error).toHaveBeenCalled();
        });

        test('should rollback only the list that has previous data', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1]);

            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            const context = await optionsResult.current.onMutate!(itemIds, mutationContext);

            // Modificar subscribed después de onMutate
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [{ id: mockUUID(2) }]);

            optionsResult.current.onError!(new Error('error'), itemIds, context, mutationContext);

            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(restoredRecommended).toEqual([item1]);

            const subscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            // subscribed no se restaura porque previousSubscribed es undefined, debe quedar como estaba después de onMutate (que era [])
            expect(subscribed).toEqual([{ id: mockUUID(2) }]);
        });
    });

    describe('onSettled', () => {
        test('should invalidate queries after success', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1)];
            (surveyItemsRepository.subscribeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            // onSuccess invalidó (2) + onSettled (2) = 4
            expect(invalidateSpy).toHaveBeenCalledTimes(4);
        });

        test('should invalidate queries after error', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useSubscribeBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1)];
            (surveyItemsRepository.subscribeBatch as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            // solo onSettled invalida (2 llamadas)
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
        });
    });
});