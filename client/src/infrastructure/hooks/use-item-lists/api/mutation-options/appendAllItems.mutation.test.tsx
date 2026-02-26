// useAppendAllItemsMutationOptions.test.tsx
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useAppendAllItemsMutationOptions } from './appendAllItems.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks - include all runtime dependencies used in the mutation
jest.mock('../../../..', () => ({
    userItemListRepository: {
        appendAllItems: jest.fn(),
    },
    RadarQuadrant: {
        LANGUAGES_AND_FRAMEWORKS: 'LANGUAGES_AND_FRAMEWORKS',
        // Add other quadrant values if needed
    },
    RadarRing: {
        ADOPT: 'ADOPT',
        // Add other ring values if needed
    },
    // InsightsValues is only a type, no runtime value needed
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

describe('useAppendAllItemsMutationOptions', () => {
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;
    const mockItemIds: UUID[] = [
        '123e4567-e89b-12d3-a456-426614174001' as UUID,
        '123e4567-e89b-12d3-a456-426614174002' as UUID,
    ];

    const mockList: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [
            { id: 'existing-item-1' as UUID } as SurveyItem,
            { id: 'existing-item-2' as UUID } as SurveyItem,
        ],
    } as UserItemList;

    const mockLists: UserItemList[] = [mockList];

    const mockResult: UserItemList = {
        ...mockList,
        items: [
            ...mockList.items,
            { id: mockItemIds[0] } as SurveyItem,
            { id: mockItemIds[1] } as SurveyItem,
        ],
    };

    const mockOnMutateResult = { previousLists: mockLists };

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
        const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
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
            mockedUserItemListRepository.appendAllItems.mockResolvedValue(mockResult);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const resultData = await result.current.mutationFn!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            expect(mockedUserItemListRepository.appendAllItems).toHaveBeenCalledWith(
                mockListId,
                mockItemIds
            );
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.appendAllItems.mockRejectedValue(mockError);

            const queryClient = createTestQueryClient();
            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
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
            queryClient.setQueryData([userItemListsKey], mockLists);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const onMutateResult = await result.current.onMutate!(
                { listId: mockListId, itemIds: mockItemIds },
                createMutationContext(queryClient)
            );

            const updatedLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);
            expect(updatedLists).toBeDefined();
            expect(updatedLists!.length).toBe(1);
            const updatedList = updatedLists![0];
            expect(updatedList.id).toBe(mockListId);
            expect(updatedList.items.length).toBe(mockList.items.length + mockItemIds.length);

            const tempItems = updatedList.items.slice(-2);
            expect(tempItems[0].title).toBe('Cargando...');
            expect(tempItems[1].title).toBe('Cargando...');
            expect(tempItems[0].id).toBe(mockItemIds[0]);
            expect(tempItems[1].id).toBe(mockItemIds[1]);

            expect(onMutateResult).toEqual({ previousLists: mockLists });
        });

        it('should not update cache when no previous lists exist', async () => {
            const queryClient = createTestQueryClient();

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
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
            queryClient.setQueryData([userItemListsKey], [{ ...mockList, items: [] }]);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResult,
                createMutationContext(queryClient)
            );

            const restoredLists = queryClient.getQueryData([userItemListsKey]);
            expect(restoredLists).toEqual(mockLists);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al añadir los elementos a la lista.'
            );
        });

        it('should not restore data when onMutateResult has no previousLists', () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockLists);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                undefined,
                createMutationContext(queryClient)
            );

            const currentData = queryClient.getQueryData([userItemListsKey]);
            expect(currentData).toEqual(mockLists);
            expect(mockedToast.error).toHaveBeenCalled();
        });
    });

    describe('onSuccess', () => {
        it('should update cache with the result and show success toast', () => {
            const queryClient = createTestQueryClient();
            queryClient.setQueryData([userItemListsKey], mockLists);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            result.current.onSuccess!(
                mockResult,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResult,
                createMutationContext(queryClient)
            );

            const updatedLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);
            expect(updatedLists).toBeDefined();
            expect(updatedLists!.length).toBe(1);
            expect(updatedLists![0]).toEqual(mockResult);

            expect(mockedToast.success).toHaveBeenCalledWith(
                'Elementos añadidos exitosamente.'
            );
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the list key', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            result.current.onSettled!(
                mockResult,
                null,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResult,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });

        it('should handle onSettled with error', () => {
            const queryClient = createTestQueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(queryClient),
            });

            const mockError = new Error('Mutation failed');

            result.current.onSettled!(
                undefined,
                mockError,
                { listId: mockListId, itemIds: mockItemIds },
                mockOnMutateResult,
                createMutationContext(queryClient)
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey],
            });
        });
    });
});