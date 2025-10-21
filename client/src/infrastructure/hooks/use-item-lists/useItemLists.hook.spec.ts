import { renderHook } from '@testing-library/react';
import { useUserItemLists } from './useItemLists.hook';
import { useDispatch, useSelector } from 'react-redux';
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';
import { type UserItemList, type SurveyItem, RadarQuadrant, RadarRing, Trending } from '@/infrastructure';

// Mocks
jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('./api/useUserItemListsAPI.hook', () => ({
    useUserItemListsAPI: jest.fn(),
}));

jest.mock('@/infrastructure', () => {
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

    it('should expose Redux state and query API methods', () => {
        const { result } = renderHook(() => useUserItemLists());

        expect(result.current.lists).toEqual(['list1', 'list2']);
        expect(result.current.pendingChanges).toEqual(['change1']);
        expect(result.current.findAll).toBe(mockQueryAPI.findAll);
        expect(result.current.findOne).toBe(mockQueryAPI.findOne);
    });

    it('should dispatch addPendingCreateList correctly', () => {
        const mockList = { id: 'abc', name: 'Test List' } as UserItemList;
        const { result } = renderHook(() => useUserItemLists());

        result.current.addPendingCreateList(mockList);
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingCreateList'),
            payload: mockList,
        }));
    });

    it('should dispatch addPendingUpdateList correctly', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingUpdateList('list-id', 'New Name');

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingUpdateList'),
            payload: { listId: 'list-id', listNewName: 'New Name' },
        }));
    });

    it('should dispatch addPendingRemoveList correctly', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingRemoveList('list-id');

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingRemoveList'),
            payload: 'list-id',
        }));
    });

    it('should dispatch addPendingAppendAllItems correctly', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingAppendAllItems('list-id', [items]);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingAppendAllItems'),
            payload: { listId: 'list-id', items: [items] },
        }));

    });

    it('should dispatch addPendingRemoveAllItems correctly', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingRemoveAllItems('list-id', [items.id]);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingRemoveAllItems'),
            payload: { listId: 'list-id', itemIds: [items.id] },
        }));

    });

    it('should dispatch clearPendingChanges correctly', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.clearPendingChanges();

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('clearPendingChanges'),
        }));
    });

    it('should not dispatch addPendingCreateList if list is null', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingCreateList(null as unknown as UserItemList);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingCreateList'),
            payload: null,
        }));
    });

    it('should not dispatch addPendingUpdateList if listId or name is missing', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingUpdateList('', '');

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingUpdateList'),
            payload: { listId: '', listNewName: '' },
        }));
    });

    it('should not dispatch addPendingRemoveList if listId is undefined', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingRemoveList(undefined as unknown as string);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingRemoveList'),
            payload: undefined,
        }));
    });

    it('should not dispatch addPendingAppendAllItems if items array is empty', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingAppendAllItems('list-id', []);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingAppendAllItems'),
            payload: { listId: 'list-id', items: [] },
        }));
    });

    it('should not dispatch addPendingRemoveAllItems if itemIds array is empty', () => {
        const { result } = renderHook(() => useUserItemLists());
        result.current.addPendingRemoveAllItems('list-id', []);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: expect.stringContaining('addPendingRemoveAllItems'),
            payload: { listId: 'list-id', itemIds: [] },
        }));
    });

    it('should expose error state if API hook returns error in findAll', () => {
        const error = new Error('API failure');
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

    it('should expose empty lists if Redux selector returns undefined', () => {
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
