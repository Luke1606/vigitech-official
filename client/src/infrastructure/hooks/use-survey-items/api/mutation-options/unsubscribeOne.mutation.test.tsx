import type { UUID } from '../../../../';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useUnsubscribeOneMutationOptions } from './unsubscribeOne.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, subscribedKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        unsubscribeOne: jest.fn(),
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

describe('useUnsubscribeOneMutationOptions', () => {
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
        const { result } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onMutate');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    describe('mutationFn', () => {
        test('should call surveyItemsRepository.unsubscribeOne with the provided UUID', async () => {
            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.unsubscribeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(surveyItemsRepository.unsubscribeOne).toHaveBeenCalledTimes(1);
            expect(surveyItemsRepository.unsubscribeOne).toHaveBeenCalledWith(itemId);
        });
    });

    describe('onMutate', () => {
        test('should cancel ongoing queries, capture previous data, and optimistically remove the item', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            const item3: TestSurveyItem = { id: mockUUID(3) };

            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1, item2, item3]);

            const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

            const { result } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(2);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });

            expect(context).toEqual({
                previousSubscribed: [item1, item2, item3],
            });

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([item1, item3]);
        });

        test('should handle case when subscribed list is undefined', async () => {
            const { result } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(context).toEqual({
                previousSubscribed: undefined,
            });

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([]);
        });

        test('should handle case when item is not present in subscribed list (no change)', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1, item2]);

            const { result } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(3);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(context).toEqual({
                previousSubscribed: [item1, item2],
            });

            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(updatedSubscribed).toEqual([item1, item2]); // unchanged
        });
    });

    describe('onSuccess', () => {
        test('should invalidate subscribed query and show success toast', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.unsubscribeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            // onSuccess + onSettled = 2
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
            expect(toast.success).toHaveBeenCalledWith('Se desuscribió con éxito al elemento.');
        });
    });

    describe('onError', () => {
        test('should rollback to previous data and show error toast', async () => {
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1, item2]);

            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await optionsResult.current.onMutate!(itemId, mutationContext);

            optionsResult.current.onError!(new Error('Network error'), itemId, context, mutationContext);

            const restoredSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(restoredSubscribed).toEqual([item1, item2]);

            expect(toast.error).toHaveBeenCalledWith(
                'Error al desuscribirse al elemento seleccionado. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        test('should handle case where context is undefined (no optimistic update)', () => {
            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            optionsResult.current.onError!(new Error('Network error'), itemId, undefined, mutationContext);

            const subscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(subscribed).toBeUndefined();

            expect(toast.error).toHaveBeenCalled();
        });

        test('should not restore if previousSubscribed is undefined', async () => {
            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await optionsResult.current.onMutate!(itemId, mutationContext);

            // Modificar subscribed después de onMutate
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [{ id: mockUUID(2) }]);

            optionsResult.current.onError!(new Error('error'), itemId, context, mutationContext);

            const subscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(subscribed).toEqual([{ id: mockUUID(2) }]);
        });
    });

    describe('onSettled', () => {
        test('should invalidate subscribed query after success', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.unsubscribeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            // onSuccess (1) + onSettled (1) = 2
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
        });

        test('should invalidate subscribed query after error', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useUnsubscribeOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.unsubscribeOne as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            // solo onSettled
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
        });
    });
});