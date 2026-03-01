import type { UUID } from 'crypto';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useSubscribeOneMutationOptions } from './subscribeOne.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, recommendedKey, subscribedKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        subscribeOne: jest.fn(),
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

describe('useSubscribeOneMutationOptions', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;
    let mutationContext: { client: QueryClient; meta: Record<string, unknown> | undefined };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        mutationContext = { client: queryClient, meta: undefined };

        jest.clearAllMocks();
        queryClient.clear();
    });

    test('should return mutation options with expected properties', () => {
        const { result } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onMutate');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    describe('mutationFn', () => {
        test('should call surveyItemsRepository.subscribeOne with the provided UUID', async () => {
            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.subscribeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(surveyItemsRepository.subscribeOne).toHaveBeenCalledTimes(1);
            expect(surveyItemsRepository.subscribeOne).toHaveBeenCalledWith(itemId);
        });
    });

    describe('onMutate', () => {
        test('should cancel ongoing queries, capture previous data, and optimistically update both lists when item exists in recommended', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            const item3: TestSurveyItem = { id: mockUUID(3) };

            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2, item3]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item2]);

            const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

            const { result } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });

            expect(context).toEqual({
                previousRecommendations: [item1, item2, item3],
                previousSubscribed: [item2],
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(updatedRecommended).toEqual([item2, item3]); // item1 eliminado
            expect(updatedSubscribed).toHaveLength(2);
            expect(updatedSubscribed).toContainEqual(item2);
            expect(updatedSubscribed).toContainEqual(item1); // item1 agregado
        });

        test('should handle case when recommended list is undefined', async () => {
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item2]);

            const { result } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(context).toEqual({
                previousRecommendations: undefined,
                previousSubscribed: [item2],
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([]); // old undefined => filter => []

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([item2]); // no item to add
        });

        test('should handle case when subscribed list is undefined and item exists in recommended', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);

            const { result } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(context).toEqual({
                previousRecommendations: [item1, item2],
                previousSubscribed: undefined,
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([item2]);

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([item1]); // se crea nueva lista
        });

        test('should handle case when item to subscribe is not found in recommended (no change to subscribed)', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], []);

            const { result } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(3); // no existe
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(context).toEqual({
                previousRecommendations: [item1, item2],
                previousSubscribed: [],
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([item1, item2]); // sin cambios porque no se encontró

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([]); // sin cambios
        });
    });

    describe('onSuccess', () => {
        test('should invalidate queries and show success toast', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.subscribeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
            expect(toast.success).toHaveBeenCalledWith('Se suscribió con éxito al elemento.');
        });
    });

    describe('onError', () => {
        test('should rollback to previous data and show error toast', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item2]);

            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await optionsResult.current.onMutate!(itemId, mutationContext);

            optionsResult.current.onError!(new Error('Network error'), itemId, context, mutationContext);

            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const restoredSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(restoredRecommended).toEqual([item1, item2]);
            expect(restoredSubscribed).toEqual([item2]);

            expect(toast.error).toHaveBeenCalledWith(
                'Error al suscribirse al elemento seleccionado. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        test('should handle case where context is undefined (no optimistic update)', () => {
            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            optionsResult.current.onError!(new Error('Network error'), itemId, undefined, mutationContext);

            const recommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(recommended).toBeUndefined();

            expect(toast.error).toHaveBeenCalled();
        });

        test('should rollback only the list that has previous data', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1]);

            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await optionsResult.current.onMutate!(itemId, mutationContext);

            // Modificar subscribed después de onMutate
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [{ id: mockUUID(2) }]);

            optionsResult.current.onError!(new Error('error'), itemId, context, mutationContext);

            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(restoredRecommended).toEqual([item1]);

            const subscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            // subscribed no se restaura porque previousSubscribed es undefined, debe quedar como estaba después de onMutate (que era [])
            // pero como lo modificamos manualmente a [item2], eso prevalece
            expect(subscribed).toEqual([{ id: mockUUID(2) }]);
        });
    });

    describe('onSettled', () => {
        test('should invalidate queries after success', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.subscribeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            // onSuccess invalidó (2) + onSettled (2) = 4
            expect(invalidateSpy).toHaveBeenCalledTimes(4);
        });

        test('should invalidate queries after error', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useSubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.subscribeOne as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate(itemId);

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