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

    const mockContext = { previousLists: mockPreviousLists };
    const mockEmptyContext = { previousLists: undefined };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return mutation options with correct structure', () => {
        const { result } = renderHook(() => useDeleteListMutationOptions(), {
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
            // Para delete, normalmente no hay retorno, pero si el tipo espera UserItemList, podemos mockear un valor
            const mockResult = {} as UserItemList; // Objeto vacío o usar un tipo más específico si es necesario
            mockedUserItemListRepository.removeList.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(),
            });

            const resultData = await result.current.mutationFn!(mockListId);

            expect(mockedUserItemListRepository.removeList)
                .toHaveBeenCalledWith(mockListId);
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.removeList.mockRejectedValue(mockError);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: createWrapper(),
            });

            await expect(
                result.current.mutationFn!(mockListId)
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous lists exist', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!(mockListId);

            const updatedData = queryClient.getQueryData([userItemListsKey]);
            expect(updatedData).toEqual(mockFilteredLists);
            expect(onMutateResult).toEqual({ previousLists: mockPreviousLists });
        });

        it('should not update cache when no previous lists exist', async () => {
            const queryClient = new QueryClient();
            // No establecer datos previos

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!(mockListId);

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toBeUndefined();
            expect(onMutateResult).toEqual({ previousLists: undefined });
        });

    });

    describe('onError', () => {
        it('should restore previous data and show error toast', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                mockListId,
                mockContext
            );

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toEqual(mockPreviousLists);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al eliminar la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when context has undefined previousLists', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                mockListId,
                mockEmptyContext
            );

            expect(mockedToast.error).toHaveBeenCalled();
        });
    });

    describe('onSuccess', () => {
        it('should invalidate queries and show success toast', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Si removeList retorna un UserItemList, usamos un mock
            const mockResult = { id: mockListId } as UserItemList;

            result.current.onSuccess!(
                mockResult,
                mockListId,
                mockContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se eliminó con éxito la lista.'
            );
        });

        it('should handle success with empty context', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockResult = { id: mockListId } as UserItemList;

            result.current.onSuccess!(
                mockResult,
                mockListId,
                mockEmptyContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
            expect(mockedToast.success).toHaveBeenCalled();
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the lists', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockResult = { id: mockListId } as UserItemList;

            result.current.onSettled!(
                mockResult,
                null,
                mockListId,
                mockContext
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });

        it('should invalidate queries for the lists on error', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                mockListId,
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

            // Si removeList retorna un UserItemList, usamos un mock
            const mockResult = { id: mockListId } as UserItemList;
            mockedUserItemListRepository.removeList.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!(mockListId);

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual(mockFilteredLists);

            // Execute mutationFn
            const mutationResult = await result.current.mutationFn!(mockListId);
            expect(mutationResult).toBe(mockResult);

            // Execute onSuccess
            result.current.onSuccess!(
                mutationResult,
                mockListId,
                context!
            );

            expect(mockedToast.success).toHaveBeenCalled();

            // Execute onSettled
            result.current.onSettled!(
                mutationResult,
                null,
                mockListId,
                context!
            );
        });

        it('should handle full error flow with rollback', async () => {
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey], mockPreviousLists);
            const mockError = new Error('Mutation failed');
            mockedUserItemListRepository.removeList.mockRejectedValue(mockError);

            const { result } = renderHook(() => useDeleteListMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!(mockListId);

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey]);
            expect(optimisticData).toEqual(mockFilteredLists);

            // Execute mutationFn (fails)
            await expect(
                result.current.mutationFn!(mockListId)
            ).rejects.toThrow('Mutation failed');

            // Execute onError
            result.current.onError!(
                mockError,
                mockListId,
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
                mockListId,
                context!
            );
        });
    });
});