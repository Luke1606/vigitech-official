// useRemoveOneItemMutationOptions.test.tsx
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useRemoveOneItemMutationOptions } from './removeOneItem.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../../', () => ({
    userItemListRepository: {
        removeOneItem: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

const mockedUserItemListRepository = jest.mocked(userItemListRepository);
const mockedToast = jest.mocked(toast);

// Crear wrapper con QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useRemoveOneItemMutationOptions', () => {
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;
    const mockItemId: UUID = '123e4567-e89b-12d3-a456-426614174001' as UUID;
    const mockOtherItemId: UUID = '123e4567-e89b-12d3-a456-426614174002' as UUID;

    const mockPreviousList: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [
            { id: mockItemId } as SurveyItem,
            { id: mockOtherItemId } as SurveyItem,
        ],
    } as UserItemList;

    const mockFilteredList: UserItemList = {
        ...mockPreviousList,
        items: [
            { id: mockOtherItemId } as SurveyItem,
        ],
    };

    const mockResult: UserItemList = {
        ...mockFilteredList,
    };

    const mockContext = { previousList: mockPreviousList };
    const mockEmptyContext = { previousList: undefined };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return mutation options with correct structure', () => {
        const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
            wrapper: createWrapper(),
        });

        const options = result.current;
        expect(options).toBeDefined();
        expect(options.mutationFn).toBeDefined();
        expect(options.onMutate).toBeDefined();
        expect(options.onError).toBeDefined();
        expect(options.onSuccess).toBeDefined();
        expect(options.onSettled).toBeDefined();
    });

    describe('mutationFn', () => {
        it('should call repository with correct parameters', async () => {
            mockedUserItemListRepository.removeOneItem.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: createWrapper(),
            });

            const resultData = await result.current.mutationFn!({
                listId: mockListId,
                itemId: mockItemId
            });

            expect(mockedUserItemListRepository.removeOneItem)
                .toHaveBeenCalledWith(mockListId, mockItemId);
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.removeOneItem.mockRejectedValue(mockError);

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: createWrapper(),
            });

            await expect(
                result.current.mutationFn!({ listId: mockListId, itemId: mockItemId })
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous list exists', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey, mockListId], mockPreviousList);

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!({
                listId: mockListId,
                itemId: mockItemId
            });

            const updatedData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(updatedData).toEqual(mockFilteredList);

            expect(onMutateResult).toEqual({ previousList: mockPreviousList });
        });

        it('should not update cache when no previous list exists', async () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!({
                listId: mockListId,
                itemId: mockItemId
            });

            const currentData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(currentData).toBeUndefined();
            expect(onMutateResult).toEqual({ previousList: undefined });
        });
    });

    describe('onError', () => {
        it('should restore previous data and show error toast', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                { listId: mockListId, itemId: mockItemId },
                mockContext
            );

            const currentData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(currentData).toEqual(mockPreviousList);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al remover el elemento de la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when context has undefined previousList', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                { listId: mockListId, itemId: mockItemId },
                mockEmptyContext
            );

            expect(mockedToast.error).toHaveBeenCalled();
        });
    });

    describe('onSuccess', () => {
        it('should invalidate queries and show success toast', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemId: mockItemId },
                mockContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se quitó con éxito el elemento de la lista.'
            );
        });

        it('should handle success with empty context', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemId: mockItemId },
                mockEmptyContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
            expect(mockedToast.success).toHaveBeenCalled();
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the list', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            result.current.onSettled!(
                mockResult,
                null,
                { listId: mockListId, itemId: mockItemId },
                mockContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
        });

        it('should invalidate queries for the list on error', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                { listId: mockListId, itemId: mockItemId },
                mockEmptyContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
        });
    });

    describe('integration', () => {
        it('should complete full optimistic update flow successfully', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey, mockListId], mockPreviousList);
            mockedUserItemListRepository.removeOneItem.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!({ listId: mockListId, itemId: mockItemId });

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(optimisticData).toEqual(mockFilteredList);

            // Execute mutationFn
            const mutationResult = await result.current.mutationFn!({ listId: mockListId, itemId: mockItemId });
            expect(mutationResult).toBe(mockResult);

            // Execute onSuccess
            result.current.onSuccess!(
                mutationResult,
                { listId: mockListId, itemId: mockItemId },
                context!
            );

            expect(mockedToast.success).toHaveBeenCalled();

            // Execute onSettled
            result.current.onSettled!(
                mutationResult,
                null,
                { listId: mockListId, itemId: mockItemId },
                context!
            );
        });

        it('should handle full error flow with rollback', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey, mockListId], mockPreviousList);
            const mockError = new Error('Mutation failed');
            mockedUserItemListRepository.removeOneItem.mockRejectedValue(mockError);

            const { result } = renderHook(() => useRemoveOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!({ listId: mockListId, itemId: mockItemId });

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(optimisticData).toEqual(mockFilteredList);

            // Execute mutationFn (fails)
            await expect(
                result.current.mutationFn!({ listId: mockListId, itemId: mockItemId })
            ).rejects.toThrow('Mutation failed');

            // Execute onError
            result.current.onError!(
                mockError,
                { listId: mockListId, itemId: mockItemId },
                context!
            );

            expect(mockedToast.error).toHaveBeenCalled();

            // Verify rollback
            const rolledBackData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(rolledBackData).toEqual(mockPreviousList);

            // Execute onSettled
            result.current.onSettled!(
                undefined,
                mockError,
                { listId: mockListId, itemId: mockItemId },
                context!
            );
        });
    });
});