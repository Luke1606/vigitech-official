import { useRemoveOneItemMutationOptions } from './removeOneItem.mutation';
import { userItemListRepository } from '../../../..';
import { useQueryClient } from '@tanstack/react-query';
import { userItemListsKey } from '../constants';
import { type UUID, type UserItemList, RadarQuadrant, RadarRing, Trending } from '../../../..';

jest.mock('../../../..', () => {
    return {
        userItemListRepository: {
            removeOneItem: jest.fn(),
        },
        RadarQuadrant: {
            BUSINESS_INTEL: 'BUSINESS_INTEL',
        },
        RadarRing: {
            ADOPT: 'ADOPT',
            HOLD: 'HOLD',
        },
        Trending: {
            DOWN: 'DOWN',
            UNSTABLE: 'UNSTABLE',
        },
    };
});

jest.mock('@tanstack/react-query', () => {
    const actual = jest.requireActual('@tanstack/react-query');
    return {
        ...actual,
        useQueryClient: jest.fn(),
        mutationOptions: actual.mutationOptions,
    };
});

describe('useRemoveOneItemMutationOptions', () => {
    const mockListId: UUID = '11111111-2222-3333-4444-555555555555';
    const mockItemId: UUID = 'aaaa-bbbb-cccc-dddd-eeee';

    const mockQueryClient = {
        cancelQueries: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
    };

    const mockPreviousList: UserItemList = {
        id: mockListId,
        name: 'Lista de prueba',
        items: [
            {
                id: mockItemId,
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
            },
            {
                id: 'a1-b2-c3-d4-e5',
                title: 'Elemento B',
                summary: 'Resumen B',
                radarQuadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
                radarRing: RadarRing.HOLD,
                lastAnalysis: {
                    obtainedMetrics: {
                        citations: 20,
                        downloads: 300,
                        relevance: 0.5,
                        accesibilityLevel: 0,
                        trending: Trending.UNSTABLE
                    },
                    searchedDate: new Date('2025-10-20')
                },
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    it('should call removeOneItem in mutationFn', async () => {
        const options = useRemoveOneItemMutationOptions();
        await options.mutationFn!({ listId: mockListId, itemId: mockItemId });
        expect(userItemListRepository.removeOneItem).toHaveBeenCalledWith(mockListId, mockItemId);
    });

    it('should optimistically update cache in onMutate', async () => {
        mockQueryClient.getQueryData.mockReturnValue(mockPreviousList);

        const context = await useRemoveOneItemMutationOptions().onMutate!({ listId: mockListId, itemId: mockItemId });

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            [userItemListsKey, mockListId],
            expect.objectContaining({
                items: expect.arrayContaining([
                    expect.objectContaining({ id: 'a1-b2-c3-d4-e5' }),
                ]),
            })
        );
        expect(context).toEqual({ previousList: mockPreviousList });
    });

    it('should rollback cache in onError if context is present', () => {
        const options = useRemoveOneItemMutationOptions();
        options.onError!(
            new Error('fail'),
            { listId: mockListId, itemId: mockItemId },
            { previousList: mockPreviousList }
        );

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey, mockListId], mockPreviousList);
    });

    it('should invalidate query on success', () => {
        const options = useRemoveOneItemMutationOptions();
        options.onSuccess!(
            { id: mockListId, name: 'Lista actualizada', items: [] },
            { listId: mockListId, itemId: mockItemId },
            { previousList: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
    });

    it('should invalidate query on settled', () => {
        const options = useRemoveOneItemMutationOptions();
        options.onSettled!(
            undefined,
            null,
            { listId: mockListId, itemId: mockItemId },
            { previousList: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
    });
});
