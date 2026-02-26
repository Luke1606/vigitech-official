// useRemoveAllItemsMutationOptions.test.tsx
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useRemoveAllItemsMutationOptions } from './removeAllItems.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../../', () => ({
    userItemListRepository: {
        removeAllItems: jest.fn(),
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

// Helper to create a complete MutationFunctionContext
const createMutationContext = (queryClient: QueryClient) => ({
    signal: new AbortController().signal,
    client: queryClient,
    meta: undefined,
});

describe('useRemoveAllItemsMutationOptions', () => {
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;
    const mockItemIds: UUID[] = [
        '123e4567-e89b-12d3-a456-426614174001' as UUID,
        '123e4567-e89b-12d3-a456-426614174002' as UUID,
    ];
    const mockRemainingItemId: UUID = '123e4567-e89b-12d3-a456-426614174003' as UUID;

    const mockList: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [
            { id: mockItemIds[0] } as SurveyItem,
            { id: mockItemIds[1] } as SurveyItem,
            { id: mockRemainingItemId } as SurveyItem,
        ],
    } as UserItemList;

    // The cache stores an array of lists under [userItemListsKey]
    const mockLists: UserItemList[] = [mockList];

    // The filtered list after optimistic removal
    const mockFilteredList: UserItemList = {
        ...mockList,
        items: [{ id: mockRemainingItemId } as SurveyItem],
    };

    // The updated array after optimistic removal
    const mockFilteredLists: UserItemList[] = [mockFilteredList];

    // The result returned from the API after successful mutation
    const mockResult: UserItemList = mockFilteredList;

    // The value returned by onMutate (used in error/success/settled)
    const mockOnMutateResultWithPrevious = { previousLists: mockLists };
    const mockOnMutateResultEmpty = { previousLists: undefined };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createTestQueryClient = () => {
        return new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    };

    const createWrapper = (queryClient: QueryClient) => {
        return ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    };

    it('should return mutation options with correct structure', () => {
        const queryClient = createTestQueryClient();
        const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
            wrapper: createWrapper(queryClient),
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
            mockedUserItemListRepository.removeAllItems.mockResolvedValue(mockResult);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // mutationFn expects two arguments: variables and context
            const resultData = await result.current.mutationFn!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            expect(mockedUserItemListRepository.removeAllItems).toHaveBeenCalledWith(
                mockListId,
                mockItemIds
            );
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.removeAllItems.mockRejectedValue(mockError);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            await expect(
                result.current.mutationFn!(
                    { listId: mockListId, itemIds: mockItemIds },
                    createMutationContext(queryClient)
                )
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous lists exist', async () => {
            const queryClient = createTestQueryClient();
            // Set initial cache data as array of lists
            queryClient.setQueryData([userItemListsKey], mockLists);

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate expects two arguments: variables and context
            const onMutateResult = await result.current.onMutate!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            // Verify optimistic update on the array key
            const updatedLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);
            expect(updatedLists).toBeDefined();
            expect(updatedLists!.length).toBe(1);
            expect(updatedLists![0].items.length).toBe(1); // Only remaining item
            expect(updatedLists![0].items[0].id).toBe(mockRemainingItemId);

            // onMutate should return the previous state
            expect(onMutateResult).toEqual({ previousLists: mockLists });
        });

        it('should not update cache when no previous lists exist', async () => {
            const queryClient = createTestQueryClient();

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const onMutateResult = await result.current.onMutate!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toBeUndefined();
            expect(onMutateResult).toEqual({ previousLists: undefined });
        });
    });

    describe('onError', () => {
        it('should restore previous data and show error toast', () => {
            const queryClient = createTestQueryClient();
            // Simulate current cache with filtered data (e.g., after optimistic update)
            queryClient.setQueryData([userItemListsKey], mockFilteredLists);

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            // onError expects four arguments:
            // error, variables, onMutateResult, context
            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            // Verify cache is restored to previousLists
            const restoredLists = queryClient.getQueryData([userItemListsKey]);
            expect(restoredLists).toEqual(mockLists);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al remover los elementos de la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when onMutateResult has undefined previousLists', () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockLists);

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(mockedToast.error).toHaveBeenCalled();
            // Cache should remain unchanged (still mockLists)
        });
    });

    describe('onSuccess', () => {
        it('should invalidate queries and show success toast with item count', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onSuccess expects four arguments:
            // data, variables, onMutateResult, context
            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            // Should invalidate both keys
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });

            // Success message includes dynamic count
            expect(mockedToast.success).toHaveBeenCalledWith(
                `Se quitaron ${mockItemIds.length} elemento(s) de la lista.`
            );
        });

        it('should handle success with empty onMutateResult', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
            expect(mockedToast.success).toHaveBeenCalled();
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for both keys', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onSettled expects five arguments:
            // data, error, variables, onMutateResult, context
            result.current.onSettled!(
                mockResult,
                null,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });

        it('should invalidate queries on error', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });
    });

    describe('integration', () => {
        it('should complete full optimistic update flow successfully', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockLists);
            mockedUserItemListRepository.removeAllItems.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate
            const onMutateResult = await result.current.onMutate!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            // Verify optimistic update on array key
            const optimisticLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);
            expect(optimisticLists).toEqual(mockFilteredLists);

            // mutationFn
            const mutationResult = await result.current.mutationFn!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );
            expect(mutationResult).toBe(mockResult);

            // onSuccess
            result.current.onSuccess!(
                mutationResult,
                { listId: mockListId, itemIds: mockItemIds },
                onMutateResult,
                createMutationContext(queryClient)
            );

            expect(mockedToast.success).toHaveBeenCalled();

            // onSettled
            result.current.onSettled!(
                mutationResult,
                null,
                { listId: mockListId, itemIds: mockItemIds },
                onMutateResult,
                createMutationContext(queryClient)
            );
        });

        it('should handle full error flow with rollback', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockLists);
            const mockError = new Error('Mutation failed');
            mockedUserItemListRepository.removeAllItems.mockRejectedValue(mockError);

            const { result } = renderHook(() => useRemoveAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate
            const onMutateResult = await result.current.onMutate!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            // Verify optimistic update
            const optimisticLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);
            expect(optimisticLists).toEqual(mockFilteredLists);

            // mutationFn (fails)
            await expect(
                result.current.mutationFn!(
                    { listId: mockListId, itemIds: mockItemIds },
                    createMutationContext(queryClient)
                )
            ).rejects.toThrow('Mutation failed');

            // onError
            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                onMutateResult,
                createMutationContext(queryClient)
            );

            expect(mockedToast.error).toHaveBeenCalled();

            // Verify rollback
            const rolledBackLists = queryClient.getQueryData([userItemListsKey]);
            expect(rolledBackLists).toEqual(mockLists);

            // onSettled
            result.current.onSettled!(
                undefined,
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                onMutateResult,
                createMutationContext(queryClient)
            );
        });
    });
});