import { useAppendOneItemMutationOptions } from './appendOneItem.mutation';
import { userItemListRepository } from '../../../..';
import { useQueryClient } from '@tanstack/react-query';
import { userItemListsKey } from '../constants';
import type { UUID, UserItemList } from '../../../..';

jest.mock('../../../..', () => ({
    userItemListRepository: {
        appendOneItem: jest.fn(),
    },
}));

jest.mock('@tanstack/react-query', () => {
    const actual = jest.requireActual('@tanstack/react-query');
    return {
        ...actual,
        useQueryClient: jest.fn(),
        mutationOptions: actual.mutationOptions,
    };
});

describe('useAppendOneItemMutationOptions', () => {
    const mockListId: UUID = '11111111-2222-3333-4444-555555555555';
    const mockItemId: UUID = '99999999-aaaa-bbbb-cccc-dddddddddddd';

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

    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    it('should call appendOneItem in mutationFn', async () => {
        const options = useAppendOneItemMutationOptions();
        await options.mutationFn!({ listId: mockListId, itemId: mockItemId });
        expect(userItemListRepository.appendOneItem).toHaveBeenCalledWith(mockListId, mockItemId);
    });

    it('should optimistically update cache in onMutate', async () => {
        mockQueryClient.getQueryData.mockReturnValue(mockPreviousList);

        const options = useAppendOneItemMutationOptions();
        const context = await options.onMutate!({ listId: mockListId, itemId: mockItemId });

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            [userItemListsKey, mockListId],
            expect.objectContaining({
                items: expect.arrayContaining([{ id: mockItemId }]),
            })
        );
        expect(context).toEqual({ previousList: mockPreviousList });
    });

    it('should rollback cache in onError if context is present', () => {
        const options = useAppendOneItemMutationOptions();
        options.onError!(
            new Error('fail'),
            { listId: mockListId, itemId: mockItemId },
            { previousList: mockPreviousList }
        );

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey, mockListId], mockPreviousList);
    });

    it('should invalidate query on success', () => {
        const mockData: UserItemList = { ...mockPreviousList };
        const options = useAppendOneItemMutationOptions();
        options.onSuccess!(
            mockData,
            { listId: mockListId, itemId: mockItemId },
            { previousList: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
    });

    it('should invalidate query on settled', () => {
        const options = useAppendOneItemMutationOptions();
        options.onSettled!(
            undefined,
            null,
            { listId: mockListId, itemId: mockItemId },
            { previousList: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey, mockListId] });
    });
});
