import { useAppendAllItemsMutationOptions } from './appendAllItems.mutation';
import { userItemListRepository } from '../../../..';
import { userItemListsKey } from '../constants';
import type { UUID, UserItemList } from '../../../..';
import { useQueryClient } from '@tanstack/react-query';

jest.mock('../../../..', () => ({
    userItemListRepository: {
        appendAllItems: jest.fn(),
    },
}));

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
    mutationOptions: jest.requireActual('@tanstack/react-query').mutationOptions,
}));

describe('useAppendAllItemsMutationOptions', () => {
    const mockListId: UUID = '11111111-2222-3333-4444-555555555555';
    const mockItemIds: UUID[] = ['99999999-aaaa-bbbb-cccc-dddddddddddd'];

    const mockQueryClient = {
        cancelQueries: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
    };

    const mockPreviousList: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [],
    };

    const mockData: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [],
    };


    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    it('should call appendAllItems in mutationFn', async () => {
        const options = useAppendAllItemsMutationOptions();
        await options.mutationFn!({ listId: mockListId, itemIds: mockItemIds });
        expect(userItemListRepository.appendAllItems).toHaveBeenCalledWith(mockListId, mockItemIds);
    });

    it('should optimistically update cache in onMutate', async () => {
        mockQueryClient.getQueryData.mockReturnValue(mockPreviousList);

        const options = useAppendAllItemsMutationOptions();
        const context = await options.onMutate!({ listId: mockListId, itemIds: mockItemIds });

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            [userItemListsKey, mockListId],
            expect.objectContaining({
                items: expect.arrayContaining([{ id: mockItemIds[0] }]),
            })
        );
        expect(context).toEqual({ previousList: mockPreviousList });
    });

    it('should rollback cache in onError if context is present', () => {
        const options = useAppendAllItemsMutationOptions();
        options.onError!(
            new Error('fail'),
            { listId: mockListId, itemIds: mockItemIds },
            { previousList: mockPreviousList }
        );

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey, mockListId], mockPreviousList);
    });

    it('should invalidate query on success', () => {
        const options = useAppendAllItemsMutationOptions();
        options.onSuccess!(
            mockData,
            { listId: mockListId, itemIds: mockItemIds },
            { previousList: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
    });

    it('should invalidate query on settled', () => {
        const options = useAppendAllItemsMutationOptions();
        options.onSettled!(
            undefined,
            null,
            { listId: mockListId, itemIds: mockItemIds },
            { previousList: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
    });

});
