// useCreateListMutationOptions.test.tsx
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useCreateListMutationOptions } from './createList.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../../', () => ({
    userItemListRepository: {
        createList: jest.fn(),
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

// Helper to create a complete MutationFunctionContext (required for mutationFn and onMutate)
const createMutationContext = (queryClient: QueryClient) => ({
    signal: new AbortController().signal,
    client: queryClient,
    meta: undefined,
});

describe('useCreateListMutationOptions', () => {
    const mockListName = 'Test List';
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;

    const mockPreviousLists: UserItemList[] = [
        {
            id: '11111111-1111-1111-1111-111111111111' as UUID,
            name: 'Existing List 1',
            items: [],
        } as UserItemList,
        {
            id: '22222222-2222-2222-2222-222222222222' as UUID,
            name: 'Existing List 2',
            items: [],
        } as UserItemList,
    ];

    const mockOptimisticList: UserItemList = {
        id: mockListId,
        name: mockListName,
        items: [],
    } as UserItemList;

    const mockCreatedList: UserItemList = {
        ...mockOptimisticList,
    };

    // This is the value returned by onMutate (used as third argument in onError/onSuccess/onSettled)
    const mockOnMutateResultWithPrevious = { previousLists: mockPreviousLists };
    const mockOnMutateResultEmpty = { previousLists: undefined };

    // Mock crypto.randomUUID before each test
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock crypto.randomUUID
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                randomUUID: () => mockListId,
            },
            writable: true,
        });

        // Mock window.crypto as well
        Object.defineProperty(window, 'crypto', {
            value: {
                randomUUID: () => mockListId,
            },
            writable: true,
        });

        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
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
        const { result } = renderHook(() => useCreateListMutationOptions(), {
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
            mockedUserItemListRepository.createList.mockResolvedValue(mockCreatedList);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // mutationFn requires two arguments: variables and context
            const resultData = await result.current.mutationFn!(
                mockListName,
                createMutationContext(queryClient)
            );

            expect(mockedUserItemListRepository.createList).toHaveBeenCalledWith(mockListName);
            expect(resultData).toBe(mockCreatedList);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.createList.mockRejectedValue(mockError);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            await expect(
                result.current.mutationFn!(mockListName, createMutationContext(queryClient))
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous lists exist', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate requires two arguments: variables and context
            const onMutateResult = await result.current.onMutate!(
                mockListName,
                createMutationContext(queryClient)
            );

            const updatedData = queryClient.getQueryData([userItemListsKey]);
            expect(updatedData).toEqual([...mockPreviousLists, mockOptimisticList]);
            expect(onMutateResult).toEqual({ previousLists: mockPreviousLists });
        });

        it('should not update cache when no previous lists exist', async () => {
            const queryClient = createTestQueryClient();

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const onMutateResult = await result.current.onMutate!(
                mockListName,
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

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            // onError expects four arguments:
            // error, variables, onMutateResult, context
            result.current.onError!(
                mockError,
                mockListName,
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toEqual(mockPreviousLists);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al crear la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when onMutateResult has undefined previousLists', () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                mockListName,
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(mockedToast.error).toHaveBeenCalled();
            // Cache should remain unchanged (still mockPreviousLists)
        });
    });

    describe('onSuccess', () => {
        it('should show success toast with onMutateResult', () => {
            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onSuccess expects four arguments:
            // data, variables, onMutateResult, context
            result.current.onSuccess!(
                mockCreatedList,
                mockListName,
                mockOnMutateResultWithPrevious,
                createMutationContext(queryClient)
            );

            expect(mockedToast.success).toHaveBeenCalledWith('Se creó con éxito la lista.');
        });

        it('should show success toast with empty onMutateResult', () => {
            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            result.current.onSuccess!(
                mockCreatedList,
                mockListName,
                mockOnMutateResultEmpty,
                createMutationContext(queryClient)
            );

            expect(mockedToast.success).toHaveBeenCalledWith('Se creó con éxito la lista.');
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the lists', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onSettled expects five arguments:
            // data, error, variables, onMutateResult, context
            result.current.onSettled!(
                mockCreatedList,
                null,
                mockListName,
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

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                mockListName,
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
            mockedUserItemListRepository.createList.mockResolvedValue(mockCreatedList);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate
            const onMutateResult = await result.current.onMutate!(
                mockListName,
                createMutationContext(queryClient)
            );

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual([...mockPreviousLists, mockOptimisticList]);

            // mutationFn
            const mutationResult = await result.current.mutationFn!(
                mockListName,
                createMutationContext(queryClient)
            );
            expect(mutationResult).toBe(mockCreatedList);

            // onSuccess
            result.current.onSuccess!(
                mutationResult,
                mockListName,
                onMutateResult,
                createMutationContext(queryClient)
            );

            expect(mockedToast.success).toHaveBeenCalled();

            // onSettled
            result.current.onSettled!(
                mutationResult,
                null,
                mockListName,
                onMutateResult,
                createMutationContext(queryClient)
            );
        });

        it('should handle full error flow with rollback', async () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);
            const mockError = new Error('Mutation failed');
            mockedUserItemListRepository.createList.mockRejectedValue(mockError);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            // onMutate
            const onMutateResult = await result.current.onMutate!(
                mockListName,
                createMutationContext(queryClient)
            );

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual([...mockPreviousLists, mockOptimisticList]);

            // mutationFn (fails)
            await expect(
                result.current.mutationFn!(mockListName, createMutationContext(queryClient))
            ).rejects.toThrow('Mutation failed');

            // onError
            result.current.onError!(
                mockError,
                mockListName,
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
                mockListName,
                onMutateResult,
                createMutationContext(queryClient)
            );
        });
    });
});