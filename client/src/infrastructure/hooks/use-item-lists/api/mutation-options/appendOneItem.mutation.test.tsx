// useAppendOneItemMutationOptions.test.tsx
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useAppendOneItemMutationOptions } from './appendOneItem.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../../', () => ({
    userItemListRepository: {
        appendOneItem: jest.fn(),
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

describe('useAppendOneItemMutationOptions', () => {
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;
    const mockItemId: UUID = '123e4567-e89b-12d3-a456-426614174001' as UUID;

    const mockPreviousList: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [
            { id: 'existing-item-1' as UUID } as SurveyItem,
            { id: 'existing-item-2' as UUID } as SurveyItem,
        ],
    } as UserItemList;

    const mockResult: UserItemList = {
        ...mockPreviousList,
        items: [
            ...mockPreviousList.items,
            { id: mockItemId } as SurveyItem,
        ],
    };

    const mockContext = { previousList: mockPreviousList };
    const mockEmptyContext = { previousList: undefined };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return mutation options with correct structure', () => {
        const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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
            mockedUserItemListRepository.appendOneItem.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
                wrapper: createWrapper(),
            });

            const resultData = await result.current.mutationFn!({
                listId: mockListId,
                itemId: mockItemId
            });

            expect(mockedUserItemListRepository.appendOneItem)
                .toHaveBeenCalledWith(mockListId, mockItemId);
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.appendOneItem.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!({
                listId: mockListId,
                itemId: mockItemId
            });

            const updatedData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(updatedData).toEqual({
                ...mockPreviousList,
                items: [
                    ...mockPreviousList.items,
                    { id: mockItemId },
                ],
            });

            expect(onMutateResult).toEqual({ previousList: mockPreviousList });
        });

        it('should not update cache when no previous list exists', async () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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
                'Error al añadir el elemento a la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when context has undefined previousList', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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
        it('should show success toast with context', () => {
            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
                wrapper: createWrapper(),
            });

            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemId: mockItemId },
                mockContext
            );

            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se añadió con éxito el elemento.'
            );
        });

        it('should show success toast with empty context', () => {
            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
                wrapper: createWrapper(),
            });

            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemId: mockItemId },
                mockEmptyContext
            );

            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se añadió con éxito el elemento.'
            );
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the list on success', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
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
            mockedUserItemListRepository.appendOneItem.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!({ listId: mockListId, itemId: mockItemId });

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(optimisticData).toEqual({
                ...mockPreviousList,
                items: [...mockPreviousList.items, { id: mockItemId }],
            });

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
            mockedUserItemListRepository.appendOneItem.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAppendOneItemMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Execute onMutate
            const context = await result.current.onMutate!({ listId: mockListId, itemId: mockItemId });

            // Verify optimistic update
            const optimisticData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(optimisticData).toEqual({
                ...mockPreviousList,
                items: [...mockPreviousList.items, { id: mockItemId }],
            });

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