import type { UUID } from '../../../../../infrastructure';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useRemoveBatchMutationOptions } from './removeBatch.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, recommendedKey, subscribedKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        removeBatch: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Helper para generar UUIDs falsos
const mockUUID = (id: number): UUID => `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}` as UUID;

// Definir estructura mínima de SurveyItem
interface TestSurveyItem {
    id: UUID;
    title?: string;
}

describe('useRemoveBatchMutationOptions', () => {
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
        const { result } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onMutate');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    describe('onMutate', () => {
        test('should cancel ongoing queries, capture previous data, and optimistically remove items from both lists', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            const item3: TestSurveyItem = { id: mockUUID(3) };

            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2, item3]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1, item2]);

            const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

            const { result } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1), mockUUID(3)];
            const context = await result.current.onMutate!(itemIds, mutationContext);

            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });

            expect(context).toEqual({
                previousRecommendations: [item1, item2, item3],
                previousSubscribed: [item1, item2],
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(updatedRecommended).toEqual([item2]);
            expect(updatedSubscribed).toEqual([item2]);
        });

        test('should handle case when there is no previous data (undefined)', async () => {
            const { result } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            const context = await result.current.onMutate!(itemIds, mutationContext);

            expect(context).toEqual({
                previousRecommendations: undefined,
                previousSubscribed: undefined,
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([]);
        });
    });

    describe('onSuccess', () => {
        test('should invalidate queries, show success toast, and call cleanup callback with variables', async () => {
            const onSuccessCleanup = jest.fn();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useRemoveBatchMutationOptions(onSuccessCleanup),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1), mockUUID(2)];
            (surveyItemsRepository.removeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
            expect(toast.success).toHaveBeenCalledWith('Elementos eliminados correctamente.');
            expect(onSuccessCleanup).toHaveBeenCalledWith(itemIds);
        });

        test('should not call cleanup callback if not provided', async () => {
            const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1)];
            (surveyItemsRepository.removeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(toast.success).toHaveBeenCalled();
        });
    });

    describe('onError', () => {
        test('should rollback to previous data and show error toast', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1]);

            const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            const context = await optionsResult.current.onMutate!(itemIds, mutationContext);

            optionsResult.current.onError!(new Error('Network error'), itemIds, context, mutationContext);

            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const restoredSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(restoredRecommended).toEqual([item1, item2]);
            expect(restoredSubscribed).toEqual([item1]);

            expect(toast.error).toHaveBeenCalledWith('Error al eliminar los elementos.');
        });

        test('should handle case where context is undefined (no optimistic update)', () => {
            const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            optionsResult.current.onError!(new Error('Network error'), itemIds, undefined, mutationContext);

            const recommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(recommended).toBeUndefined();

            expect(toast.error).toHaveBeenCalledWith('Error al eliminar los elementos.');
        });

        test('should rollback only the list that has previous data', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1]);

            const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const itemIds = [mockUUID(1)];
            const context = await optionsResult.current.onMutate!(itemIds, mutationContext);

            // Modificar subscribedKey después de onMutate
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [{ id: mockUUID(2) }]);

            optionsResult.current.onError!(new Error('error'), itemIds, context, mutationContext);

            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(restoredRecommended).toEqual([item1]);

            const subscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(subscribed).toEqual([{ id: mockUUID(2) }]);
        });
    });

    describe('onSettled', () => {
        test('should invalidate queries after success', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1)];
            (surveyItemsRepository.removeBatch as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
            expect(invalidateSpy).toHaveBeenCalledTimes(4); // onSuccess (2) + onSettled (2)
        });

        test('should invalidate queries after error', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemIds = [mockUUID(1)];
            (surveyItemsRepository.removeBatch as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate(itemIds);

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
            expect(invalidateSpy).toHaveBeenCalledTimes(2); // solo onSettled
        });
    });

    test('should call mutationFn with correct arguments', async () => {
        const { result: optionsResult } = renderHook(() => useRemoveBatchMutationOptions(), { wrapper });

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const itemIds = [mockUUID(1), mockUUID(2)];
        (surveyItemsRepository.removeBatch as jest.Mock).mockResolvedValueOnce(undefined);

        mutationResult.current.mutate(itemIds);

        await waitFor(() => {
            expect(mutationResult.current.isSuccess).toBe(true);
        });

        expect(surveyItemsRepository.removeBatch).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.removeBatch).toHaveBeenCalledWith(itemIds);
    });
});