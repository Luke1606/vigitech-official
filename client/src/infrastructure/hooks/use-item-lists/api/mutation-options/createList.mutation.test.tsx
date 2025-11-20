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

    const mockContext = { previousLists: mockPreviousLists };
    const mockEmptyContext = { previousLists: undefined };

    // Mock crypto.randomUUID antes de cada prueba
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock crypto.randomUUID de manera más robusta
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                randomUUID: () => mockListId,
            },
            writable: true,
        });

        // Mock window.crypto también por si acaso
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

    it('should return mutation options with correct structure', () => {
        const { result } = renderHook(() => useCreateListMutationOptions(), {
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
            mockedUserItemListRepository.createList.mockResolvedValue(mockCreatedList);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(),
            });

            const resultData = await result.current.mutationFn!(mockListName);

            expect(mockedUserItemListRepository.createList)
                .toHaveBeenCalledWith(mockListName);
            expect(resultData).toBe(mockCreatedList);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.createList.mockRejectedValue(mockError);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(),
            });

            await expect(
                result.current.mutationFn!(mockListName)
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous lists exist', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!(mockListName);

            const updatedData = queryClient.getQueryData([userItemListsKey]);
            expect(updatedData).toEqual([
                ...mockPreviousLists,
                mockOptimisticList,
            ]);

            expect(onMutateResult).toEqual({ previousLists: mockPreviousLists });
        });

        it('should not update cache when no previous lists exist', async () => {
            const queryClient = new QueryClient();
            // No establecer datos previos

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!(mockListName);

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toBeUndefined();
            expect(onMutateResult).toEqual({ previousLists: undefined });
        });
    });

    describe('onError', () => {
        it('should restore previous data and show error toast', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                mockListName,
                mockContext
            );

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toEqual(mockPreviousLists);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al crear la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when context has undefined previousLists', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                mockListName,
                mockEmptyContext
            );

            expect(mockedToast.error).toHaveBeenCalled();
        });
    });

    describe('onSuccess', () => {
        it('should show success toast with context', () => {
            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(),
            });

            result.current.onSuccess!(
                mockCreatedList,
                mockListName,
                mockContext
            );

            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se creó con éxito la lista.'
            );
        });

        it('should show success toast with empty context', () => {
            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: createWrapper(),
            });

            result.current.onSuccess!(
                mockCreatedList,
                mockListName,
                mockEmptyContext
            );

            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se creó con éxito la lista.'
            );
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the lists', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            result.current.onSettled!(
                mockCreatedList,
                null,
                mockListName,
                mockContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });

        it('should invalidate queries for the lists on error', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                mockListName,
                mockEmptyContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });
    });

    describe('integration', () => {
        it('should complete full optimistic update flow successfully', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);
            mockedUserItemListRepository.createList.mockResolvedValue(mockCreatedList);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!(mockListName);

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual([
                ...mockPreviousLists,
                mockOptimisticList,
            ]);

            // Execute mutationFn
            const mutationResult = await result.current.mutationFn!(mockListName);
            expect(mutationResult).toBe(mockCreatedList);

            // Execute onSuccess
            result.current.onSuccess!(
                mutationResult,
                mockListName,
                context!
            );

            expect(mockedToast.success).toHaveBeenCalled();

            // Execute onSettled
            result.current.onSettled!(
                mutationResult,
                null,
                mockListName,
                context!
            );
        });

        it('should handle full error flow with rollback', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);
            const mockError = new Error('Mutation failed');
            mockedUserItemListRepository.createList.mockRejectedValue(mockError);

            const { result } = renderHook(() => useCreateListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!(mockListName);

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual([
                ...mockPreviousLists,
                mockOptimisticList,
            ]);

            // Execute mutationFn (fails)
            await expect(
                result.current.mutationFn!(mockListName)
            ).rejects.toThrow('Mutation failed');

            // Execute onError
            result.current.onError!(
                mockError,
                mockListName,
                context!
            );

            expect(mockedToast.error).toHaveBeenCalled();

            // Verify rollback
            const rolledBackData = queryClient.getQueryData([userItemListsKey]);
            expect(rolledBackData).toEqual(mockPreviousLists);

            // Execute onSettled
            result.current.onSettled!(
                undefined,
                mockError,
                mockListName,
                context!
            );
        });
    });
});