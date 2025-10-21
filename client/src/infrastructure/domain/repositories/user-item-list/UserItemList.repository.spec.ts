// __tests__/UserItemListRepository.spec.ts
import { userItemListRepository } from '@/infrastructure/domain/repositories/user-item-list/UserItemList.repository';
import { AxiosConfiguredInstance, RadarQuadrant, RadarRing, Trending } from '@/infrastructure';
import type { SurveyItem, UserItemList } from '@/infrastructure';

jest.mock('@/infrastructure', () => {
    const mockHttp = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
    };

    return {
        AxiosConfiguredInstance: jest.fn().mockImplementation(() => ({
            http: mockHttp
        })),
        getEnv: () => ({
            VITE_SERVER_BASE_URL: 'http://localhost:3000'
        }),
        RadarQuadrant: {
            BUSSINESS_INTEL: 'BUSSINESS_INTEL'
        },
        RadarRing: {
            ADOPT: 'ADOPT'
        },
        Trending: {
            DOWN: 'DOWN',
            UP: 'UP',
            STABLE: 'STABLE'
        }
    };
});

const mockHttp = (AxiosConfiguredInstance as jest.Mock).mock.results[0].value.http;

const listId = 'aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const itemId = '11111111-2222-3333-4444-555555555555';

const mockSurveyItem: SurveyItem = {
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

const mockList: UserItemList = {
    id: listId,
    name: 'My List',
    items: [mockSurveyItem]
};

describe('UserItemListRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findAll should return all lists', async () => {
        mockHttp.get.mockResolvedValueOnce([mockList]);
        const result = await userItemListRepository.findAll();
        expect(mockHttp.get).toHaveBeenCalledWith('');
        expect(result).toEqual([mockList]);
    });

    it('findOne should return a specific list', async () => {
        mockHttp.get.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.findOne(listId);
        expect(mockHttp.get).toHaveBeenCalledWith(listId);
        expect(result).toEqual(mockList);
    });

    it('createList should post a new list', async () => {
        mockHttp.post.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.createList('My List');
        expect(mockHttp.post).toHaveBeenCalledWith('', 'My List');
        expect(result).toEqual(mockList);
    });

    it('updateList should patch list name', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.updateList(listId, 'Updated Name');
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            listName: 'Updated Name'
        });
        expect(result).toEqual(mockList);
    });

    it('removeList should delete a list', async () => {
        mockHttp.delete.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.removeList(listId);
        expect(mockHttp.delete).toHaveBeenCalledWith(listId);
        expect(result).toEqual(mockList);
    });

    it('appendOneItem should patch one item', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.appendOneItem(listId, itemId);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemId
        });
        expect(result).toEqual(mockList);
    });

    it('appendAllItems should patch multiple items', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.appendAllItems(listId, [itemId]);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemIds: [itemId]
        });
        expect(result).toEqual(mockList);
    });

    it('removeOneItem should patch one item removal', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.removeOneItem(listId, itemId);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemId
        });
        expect(result).toEqual(mockList);
    });

    it('removeAllItems should patch multiple item removals', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.removeAllItems(listId, [itemId]);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemIds: [itemId]
        });
        expect(result).toEqual(mockList);
    });
});
