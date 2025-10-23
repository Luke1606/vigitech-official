import { renderHook } from '@testing-library/react';
import { useUserItemLists } from './useItemLists.hook';
import { useDispatch, useSelector } from 'react-redux';
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';
import { type UserItemList, type SurveyItem, RadarQuadrant, RadarRing, Trending } from '../..';

// Mocks
jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('./api/useUserItemListsAPI.hook', () => ({
    useUserItemListsAPI: jest.fn(),
}));

jest.mock('../..', () => {
    class MockAxiosConfiguredInstance {
        http = {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
        };
    }

    return {
        AxiosConfiguredInstance: MockAxiosConfiguredInstance,
        getEnv: () => ({
            VITE_SERVER_BASE_URL: 'http://localhost:3000',
        }),
        RadarQuadrant: {
            BUSSINESS_INTEL: 'BUSSINESS_INTEL',
        },
        RadarRing: {
            ADOPT: 'ADOPT',
        },
        Trending: {
            DOWN: 'DOWN',
            UP: 'UP',
            STABLE: 'STABLE',
        },

        // ✅ Mock de funciones Redux
        addPendingCreateList: jest.fn((list) => ({ type: 'addPendingCreateList', payload: list })),
        addPendingUpdateList: jest.fn((payload) => ({ type: 'addPendingUpdateList', payload })),
        addPendingRemoveList: jest.fn((listId) => ({ type: 'addPendingRemoveList', payload: listId })),
        addPendingAppendAllItems: jest.fn((payload) => ({ type: 'addPendingAppendAllItems', payload })),
        addPendingRemoveAllItems: jest.fn((payload) => ({ type: 'addPendingRemoveAllItems', payload })),
        clearPendingChanges: jest.fn(() => ({ type: 'clearPendingChanges' })),
    };
});


const itemId = '11111111-2222-3333-4444-555555555555';
const items: SurveyItem = {
    id: itemId,
    title: 'Elemento A',
    summary: 'Resumen A',
    radarQuadrant: RadarQuadrant.BUSSINESS_INTEL,
    radarRing: RadarRing.ADOPT,
    lastAnalysis: {
        obtainedMetrics: {
            citations: 12,
            downloads: 340,
            relevance: 0.85,
            accesibilityLevel: 0,
            trending: Trending.DOWN
        },
        searchedDate: new Date('2025-10-20')
    }
};

describe('useUserItemLists', () => {
    const mockDispatch = jest.fn();
    const mockQueryAPI = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        createList: jest.fn(),
        deleteList: jest.fn(),
        appendOneItem: jest.fn(),
        appendAllItem: jest.fn(),
        removeOneItem: jest.fn(),
        removeAllItem: jest.fn(),
        isLoading: {},
        hasError: {},
    };

    beforeEach(() => {
        (jest.mocked(useDispatch as unknown as jest.Mock)).mockReturnValue(mockDispatch);
        (useSelector as unknown as jest.Mock).mockImplementation((selectorFn: any) => {
            return selectorFn({
                itemLists: {
                    lists: ['list1', 'list2'],
                    pendingChanges: ['change1'],
                },
            });
        });

        (useUserItemListsAPI as jest.Mock).mockReturnValue(mockQueryAPI);
        mockDispatch.mockClear();
    });

    describe('useUserItemLists', () => {
        // ...

        it('debería exponer el estado de Redux y los métodos de la API', () => {
            const { result } = renderHook(() => useUserItemLists());

            expect(result.current.lists).toEqual(['list1', 'list2']);
            expect(result.current.pendingChanges).toEqual(['change1']);
            expect(result.current.findAll).toBe(mockQueryAPI.findAll);
            expect(result.current.findOne).toBe(mockQueryAPI.findOne);
        });

        it('debería despachar addPendingCreateList correctamente', () => {
            const mockList = { id: 'abc', name: 'Test List' } as UserItemList;
            const { result } = renderHook(() => useUserItemLists());

            result.current.addPendingCreateList(mockList);
            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingCreateList'),
                payload: mockList,
            }));
        });

        it('debería despachar addPendingUpdateList correctamente', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingUpdateList('list-id', 'New Name');

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingUpdateList'),
                payload: { listId: 'list-id', listNewName: 'New Name' },
            }));
        });

        it('debería despachar addPendingRemoveList correctamente', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingRemoveList('list-id');

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingRemoveList'),
                payload: 'list-id',
            }));
        });

        it('debería despachar addPendingAppendAllItems correctamente', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingAppendAllItems('list-id', [items]);

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingAppendAllItems'),
                payload: { listId: 'list-id', items: [items] },
            }));
        });

        it('debería despachar addPendingRemoveAllItems correctamente', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingRemoveAllItems('list-id', [items.id]);

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingRemoveAllItems'),
                payload: { listId: 'list-id', itemIds: [items.id] },
            }));
        });

        it('debería despachar clearPendingChanges correctamente', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.clearPendingChanges();

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('clearPendingChanges'),
            }));
        });

        // Finales negativos

        it('no debería despachar addPendingCreateList si la lista es null', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingCreateList(null as unknown as UserItemList);

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingCreateList'),
                payload: null,
            }));
        });

        it('no debería despachar addPendingUpdateList si el ID o nombre están vacíos', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingUpdateList('', '');

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingUpdateList'),
                payload: { listId: '', listNewName: '' },
            }));
        });

        it('no debería despachar addPendingRemoveList si el ID es undefined', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingRemoveList(undefined as unknown as string);

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingRemoveList'),
                payload: undefined,
            }));
        });

        it('no debería despachar addPendingAppendAllItems si el array de ítems está vacío', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingAppendAllItems('list-id', []);

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingAppendAllItems'),
                payload: { listId: 'list-id', items: [] },
            }));
        });

        it('no debería despachar addPendingRemoveAllItems si el array de IDs está vacío', () => {
            const { result } = renderHook(() => useUserItemLists());
            result.current.addPendingRemoveAllItems('list-id', []);

            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: expect.stringContaining('addPendingRemoveAllItems'),
                payload: { listId: 'list-id', itemIds: [] },
            }));
        });

        it('debería exponer error si el hook de API retorna error en findAll', () => {
            const error = new Error('Fallo de API');
            const mockFindAllError = {
                data: undefined,
                error,
                isLoading: false,
                isError: true,
            };

            (useUserItemListsAPI as jest.Mock).mockReturnValue({
                ...mockQueryAPI,
                findAll: mockFindAllError,
            });

            const { result } = renderHook(() => useUserItemLists());
            expect(result.current.findAll.error).toBe(error);
        });

        it('debería exponer listas vacías si el selector de Redux retorna estado vacío', () => {
            (useSelector as unknown as jest.Mock).mockImplementation((selectorFn: any) => {
                return selectorFn({
                    itemLists: {
                        lists: [],
                        pendingChanges: [],
                    },
                });
            });

            const { result } = renderHook(() => useUserItemLists());
            expect(result.current.lists).toEqual([]);
            expect(result.current.pendingChanges).toEqual([]);
        });
    });
});
