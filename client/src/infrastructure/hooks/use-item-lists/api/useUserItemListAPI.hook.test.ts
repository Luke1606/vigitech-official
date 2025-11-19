// src/infrastructure/hooks/use-item-lists/api/useUserItemListAPI.hook.test.ts

import { renderHook } from '@testing-library/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserItemListsAPI } from './useUserItemListsAPI.hook';

// Mock de @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
}));

// Mock de los archivos de opciones
jest.mock('./query-options', () => ({
    findOneQueryOptions: jest.fn((listId) => ({ queryKey: ['list', listId], queryFn: jest.fn() })),
    findAllQueryOptions: jest.fn(() => ({ queryKey: ['lists'], queryFn: jest.fn() })),
}));

jest.mock('./mutation-options', () => ({
    useCreateListMutationOptions: jest.fn(() => ({ mutationKey: ['createList'], mutationFn: jest.fn() })),
    useDeleteListMutationOptions: jest.fn(() => ({ mutationKey: ['deleteList'], mutationFn: jest.fn() })),
    useUpdateListMutationOptions: jest.fn(() => ({ mutationKey: ['updateList'], mutationFn: jest.fn() })),
    useAppendOneItemMutationOptions: jest.fn(() => ({ mutationKey: ['appendOne'], mutationFn: jest.fn() })),
    useAppendAllItemsMutationOptions: jest.fn(() => ({ mutationKey: ['appendAll'], mutationFn: jest.fn() })),
    useRemoveOneItemMutationOptions: jest.fn(() => ({ mutationKey: ['removeOne'], mutationFn: jest.fn() })),
    useRemoveAllItemsMutationOptions: jest.fn(() => ({ mutationKey: ['removeAll'], mutationFn: jest.fn() })),
}));

const MockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const MockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('useUserItemListsAPI', () => {
    // Mock data
    const MOCK_LIST_ID = '123e4567-e89b-12d3-a456-426614174000' as const;

    // Mock responses para useQuery
    const mockFindAllQueryResult = {
        data: [{ id: MOCK_LIST_ID, name: 'Test List', items: [] }],
        isLoading: false,
        isError: false,
        error: null,
    };

    const mockFindOneQueryResult = {
        data: { id: MOCK_LIST_ID, name: 'Test List', items: [] },
        isLoading: false,
        isError: false,
        error: null,
    };

    // Mock simplificado que evita problemas de tipos
    const createSimpleMockMutation = (overrides: { isPending?: boolean; isError?: boolean } = {}) => {
        const baseMock = {
            mutateAsync: jest.fn(),
            mutate: jest.fn(),
            reset: jest.fn(),
            isPending: false,
            isError: false,
            error: null,
            isSuccess: false,
            data: undefined,
            variables: undefined,
            submittedAt: undefined,
            failureCount: 0,
            failureReason: null,
            isPaused: false,
            status: 'idle' as const,
        };

        return {
            ...baseMock,
            ...overrides,
        } as any;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock por defecto para useQuery
        MockUseQuery.mockImplementation((options: any) => {
            if (options?.queryKey?.[0] === 'lists') {
                return mockFindAllQueryResult as any;
            }
            if (options?.queryKey?.[0] === 'list') {
                return mockFindOneQueryResult as any;
            }
            return mockFindAllQueryResult as any;
        });

        // Mock por defecto para useMutation
        MockUseMutation.mockImplementation(() => createSimpleMockMutation());
    });

    it('should return all query and mutation functions', () => {
        const { result } = renderHook(() => useUserItemListsAPI());

        expect(result.current).toHaveProperty('findAll');
        expect(result.current).toHaveProperty('findOne');
        expect(result.current).toHaveProperty('createList');
        expect(result.current).toHaveProperty('deleteList');
        expect(result.current).toHaveProperty('updateList');
        expect(result.current).toHaveProperty('appendOneItem');
        expect(result.current).toHaveProperty('appendAllItem');
        expect(result.current).toHaveProperty('removeOneItem');
        expect(result.current).toHaveProperty('removeAllItem');
        expect(result.current).toHaveProperty('isPending');
        expect(result.current).toHaveProperty('hasError');
    });

    describe('queries', () => {
        it('should call useQuery for findAll with correct options', () => {
            const { result } = renderHook(() => useUserItemListsAPI());

            expect(MockUseQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['lists']
                })
            );

            expect(result.current.findAll).toEqual(mockFindAllQueryResult);
        });

        it('should call useQuery for findOne with correct options when used', () => {
            const { result } = renderHook(() => useUserItemListsAPI());

            const findOneResult = result.current.findOne(MOCK_LIST_ID);

            expect(MockUseQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['list', MOCK_LIST_ID]
                })
            );

            expect(findOneResult).toEqual(mockFindOneQueryResult);
        });
    });

    describe('mutations', () => {
        it('should create all mutation hooks with correct options', () => {
            renderHook(() => useUserItemListsAPI());

            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['createList'] })
            );
            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['deleteList'] })
            );
            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['updateList'] })
            );
            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['appendAll'] })
            );
            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['appendOne'] })
            );
            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['removeAll'] })
            );
            expect(MockUseMutation).toHaveBeenCalledWith(
                expect.objectContaining({ mutationKey: ['removeOne'] })
            );
        });

        it('should return mutateAsync functions for all mutations', () => {
            const { result } = renderHook(() => useUserItemListsAPI());

            expect(typeof result.current.createList).toBe('function');
            expect(typeof result.current.deleteList).toBe('function');
            expect(typeof result.current.updateList).toBe('function');
            expect(typeof result.current.appendOneItem).toBe('function');
            expect(typeof result.current.appendAllItem).toBe('function');
            expect(typeof result.current.removeOneItem).toBe('function');
            expect(typeof result.current.removeAllItem).toBe('function');
        });
    });

    describe('pending states', () => {
        it('should return correct pending states using mutationKey-based approach', () => {
            // Enfoque robusto basado en mutationKey - CORREGIDO según el orden real
            MockUseMutation.mockImplementation((options: any) => {
                const mutationKey = options?.mutationKey?.[0];

                const pendingStates: Record<string, boolean> = {
                    createList: true,
                    deleteList: false,
                    updateList: true,
                    appendAll: true,    // appendAllItem
                    appendOne: false,   // appendOneItem
                    removeAll: true,    // removeAllItem
                    removeOne: false    // removeOneItem
                };

                return createSimpleMockMutation({
                    isPending: pendingStates[mutationKey] || false
                });
            });

            const { result } = renderHook(() => useUserItemListsAPI());

            expect(result.current.isPending).toEqual({
                createList: true,
                deleteList: false,
                updateList: true,
                appendOneItem: false,  // viene de appendOne
                appendAllItem: true,   // viene de appendAll
                removeOneItem: false,  // viene de removeOne
                removeAllItem: true    // viene de removeAll
            });
        });
    });

    describe('error states', () => {
        it('should return correct error states using mutationKey-based approach', () => {
            // Enfoque robusto basado en mutationKey - CORREGIDO según el orden real
            MockUseMutation.mockImplementation((options: any) => {
                const mutationKey = options?.mutationKey?.[0];

                const errorStates: Record<string, boolean> = {
                    createList: true,
                    deleteList: false,
                    updateList: true,
                    appendAll: true,    // appendAllItem
                    appendOne: false,   // appendOneItem
                    removeAll: true,    // removeAllItem
                    removeOne: false    // removeOneItem
                };

                return createSimpleMockMutation({
                    isError: errorStates[mutationKey] || false
                });
            });

            const { result } = renderHook(() => useUserItemListsAPI());

            expect(result.current.hasError).toEqual({
                createList: true,
                deleteList: false,
                updateList: true,
                appendOneItem: false,  // viene de appendOne
                appendAllItem: true,   // viene de appendAll
                removeOneItem: false,  // viene de removeOne
                removeAllItem: true    // viene de removeAll
            });
        });
    });

    // Versión con mockReturnValueOnce usando el orden CORREGIDO
    describe('pending states - sequential mocks with correct order', () => {
        it('should return correct pending states with sequential mocks', () => {
            // ORDEN REAL según el console.log:
            // 1. createList
            // 2. deleteList
            // 3. updateList
            // 4. appendAll -> appendAllItem
            // 5. appendOne -> appendOneItem
            // 6. removeAll -> removeAllItem
            // 7. removeOne -> removeOneItem

            MockUseMutation
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: true }))   // 1. createList
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: false }))  // 2. deleteList  
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: true }))   // 3. updateList
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: true }))   // 4. appendAll -> appendAllItem
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: false }))  // 5. appendOne -> appendOneItem
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: true }))   // 6. removeAll -> removeAllItem
                .mockReturnValueOnce(createSimpleMockMutation({ isPending: false })); // 7. removeOne -> removeOneItem

            const { result } = renderHook(() => useUserItemListsAPI());

            expect(result.current.isPending).toEqual({
                createList: true,
                deleteList: false,
                updateList: true,
                appendOneItem: false,  // viene de appendOne (5)
                appendAllItem: true,   // viene de appendAll (4)
                removeOneItem: false,  // viene de removeOne (7)
                removeAllItem: true    // viene de removeAll (6)
            });
        });
    });

    describe('error states - sequential mocks with correct order', () => {
        it('should return correct error states with sequential mocks', () => {
            MockUseMutation
                .mockReturnValueOnce(createSimpleMockMutation({ isError: true }))   // 1. createList
                .mockReturnValueOnce(createSimpleMockMutation({ isError: false }))  // 2. deleteList
                .mockReturnValueOnce(createSimpleMockMutation({ isError: true }))   // 3. updateList
                .mockReturnValueOnce(createSimpleMockMutation({ isError: true }))   // 4. appendAll -> appendAllItem
                .mockReturnValueOnce(createSimpleMockMutation({ isError: false }))  // 5. appendOne -> appendOneItem
                .mockReturnValueOnce(createSimpleMockMutation({ isError: true }))   // 6. removeAll -> removeAllItem
                .mockReturnValueOnce(createSimpleMockMutation({ isError: false })); // 7. removeOne -> removeOneItem

            const { result } = renderHook(() => useUserItemListsAPI());

            expect(result.current.hasError).toEqual({
                createList: true,
                deleteList: false,
                updateList: true,
                appendOneItem: false,  // viene de appendOne (5)
                appendAllItem: true,   // viene de appendAll (4)
                removeOneItem: false,  // viene de removeOne (7)
                removeAllItem: true    // viene de removeAll (6)
            });
        });
    });

    describe('integration with query-options and mutation-options', () => {
        it('should use the correct query options from query-options module', () => {
            const { findAllQueryOptions, findOneQueryOptions } = require('./query-options');

            renderHook(() => useUserItemListsAPI());

            expect(findAllQueryOptions).toHaveBeenCalled();
            const { result } = renderHook(() => useUserItemListsAPI());
            result.current.findOne(MOCK_LIST_ID);
            expect(findOneQueryOptions).toHaveBeenCalledWith(MOCK_LIST_ID);
        });

        it('should use the correct mutation options from mutation-options module', () => {
            const {
                useCreateListMutationOptions,
                useDeleteListMutationOptions,
                useUpdateListMutationOptions,
                useAppendOneItemMutationOptions,
                useAppendAllItemsMutationOptions,
                useRemoveOneItemMutationOptions,
                useRemoveAllItemsMutationOptions
            } = require('./mutation-options');

            renderHook(() => useUserItemListsAPI());

            expect(useCreateListMutationOptions).toHaveBeenCalled();
            expect(useDeleteListMutationOptions).toHaveBeenCalled();
            expect(useUpdateListMutationOptions).toHaveBeenCalled();
            expect(useAppendOneItemMutationOptions).toHaveBeenCalled();
            expect(useAppendAllItemsMutationOptions).toHaveBeenCalled();
            expect(useRemoveOneItemMutationOptions).toHaveBeenCalled();
            expect(useRemoveAllItemsMutationOptions).toHaveBeenCalled();
        });
    });
});