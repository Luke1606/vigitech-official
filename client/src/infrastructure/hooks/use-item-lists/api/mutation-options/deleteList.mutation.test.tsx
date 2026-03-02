// useDeleteListMutationOptions.test.tsx
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useDeleteListMutationOptions } from './deleteList.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../../', () => ({
    userItemListRepository: {
        removeList: jest.fn(),
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

describe('useDeleteListMutationOptions', () => {
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;
    const mockOtherListId: UUID = '123e4567-e89b-12d3-a456-426614174001' as UUID;

    const mockPreviousLists: UserItemList[] = [
        {
            id: mockListId,
            name: 'List to delete',
            items: [],
        } as UserItemList,
        {
            id: mockOtherListId,
            name: 'Other List',
            items: [],
        } as UserItemList,
    ];

    const mockFilteredLists: UserItemList[] = [
        {
            id: mockOtherListId,
            name: 'Other List',
            items: [],
        } as UserItemList,
    ];

    // This is the value returned by onMutate (used as third argument in error/success/settled)
    const mockOnMutateResultWithPrevious = { previousLists: mockPreviousLists };
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
        const { result } = renderHook(() => useDeleteListMutationOptions(), {
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
            const mockResult = { id: mockListId } as UserItemList;
            mockedUserItemListRepository.removeList.mockResolvedValue(mockResult);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // mutationFn expects two arguments: variables and context
            const resultData = await result.current.mutationFn!(
                mockListId,
                createMutationContext(queryClient)
            );

            expect(mockedUserItemListRepository.removeList).toHaveBeenCalledWith(mockListId);
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.removeList.mockRejectedValue(mockError);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            await expect(
                result.current.mutationFn!(mockListId, createMutationContext(queryClient))
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous lists exist', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate requires two arguments: variables and context
            const onMutateResult = await result.current.onMutate!(
                mockListId,
                createMutationContext(queryClient)
            );

            const updatedData = queryClient.getQueryData([userItemListsKey]);
            expect(updatedData).toEqual(mockFilteredLists);
            expect(onMutateResult).toEqual({ previousLists: mockPreviousLists });
        });

        it('should not update cache when no previous lists exist', async () => {
            const queryClient = createTestQueryClient();

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const onMutateResult = await result.current.onMutate!(
                mockListId,
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

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            // onError expects four arguments:
            // error, variables, onMutateResult, context
            result.current.onError!(
                mockError,
                mockListId,
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toEqual(mockPreviousLists);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al eliminar la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when onMutateResult has undefined previousLists', () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                mockListId,
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(mockedToast.error).toHaveBeenCalled();
            // Cache should remain unchanged (still mockPreviousLists)
        });
    });

    describe('onSuccess', () => {
        it('should invalidate queries and show success toast', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockResult = { id: mockListId } as UserItemList;

            // onSuccess expects four arguments:
            // data, variables, onMutateResult, context
            result.current.onSuccess!(
                mockResult,
                mockListId,
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se eliminó con éxito la lista.'
            );
        });

        it('should handle success with empty onMutateResult', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockResult = { id: mockListId } as UserItemList;

            result.current.onSuccess!(
                mockResult,
                mockListId,
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
            expect(mockedToast.success).toHaveBeenCalled();
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the lists', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockResult = { id: mockListId } as UserItemList;

            // onSettled expects five arguments:
            // data, error, variables, onMutateResult, context
            result.current.onSettled!(
                mockResult,
                null,
                mockListId,
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });

        it('should invalidate queries for the lists on error', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                mockListId,
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });
    });

    describe('integration', () => {
        it('should complete full optimistic update flow successfully', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const mockResult = { id: mockListId } as UserItemList;
            mockedUserItemListRepository.removeList.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate
            const onMutateResult = await result.current.onMutate!(
                mockListId,
                createMutationContext(queryClient)
            );

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual(mockFilteredLists);

            // mutationFn
            const mutationResult = await result.current.mutationFn!(
                mockListId,
                createMutationContext(queryClient)
            );
            expect(mutationResult).toBe(mockResult);

            // onSuccess
            result.current.onSuccess!(
                mutationResult,
                mockListId,
                onMutateResult,
                createMutationContext(queryClient)
            );

            expect(mockedToast.success).toHaveBeenCalled();

            // onSettled
            result.current.onSettled!(
                mutationResult,
                null,
                mockListId,
                onMutateResult,
                createMutationContext(queryClient)
            );
        });

        it('should handle full error flow with rollback', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);
            const mockError = new Error('Mutation failed');
            mockedUserItemListRepository.removeList.mockRejectedValue(mockError);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate
            const onMutateResult = await result.current.onMutate!(
                mockListId,
                createMutationContext(queryClient)
            );

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual(mockFilteredLists);

            // mutationFn (fails)
            await expect(
                result.current.mutationFn!(mockListId, createMutationContext(queryClient))
            ).rejects.toThrow('Mutation failed');

            // onError
            result.current.onError!(
                mockError,
                mockListId,
                onMutateResult,
                createMutationContext(queryClient)
            );

            expect(mockedToast.error).toHaveBeenCalled();

            // Verify rollback
            const rolledBackData = queryClient.getQueryData([userItemListsKey]);
            expect(rolledBackData).toEqual(mockPreviousLists);

            // onSettled
            result.current.onSettled!(
                undefined,
                mockError,
                mockListId,
                onMutateResult,
                createMutationContext(queryClient)
            );
        });
    });
});