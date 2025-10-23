import { useDeleteListMutationOptions } from './deleteList.mutation';
import { userItemListRepository } from '../../../..';
import { useQueryClient } from '@tanstack/react-query';
import { userItemListsKey } from '../constants';
import type { UUID, UserItemList } from '../../../..';

jest.mock('../../../..', () => ({
    userItemListRepository: {
        removeList: jest.fn(),
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

describe('useDeleteListMutationOptions', () => {
    const mockListId: UUID = '11111111-2222-3333-4444-555555555555';

    const mockQueryClient = {
        cancelQueries: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
    };

    const mockPreviousLists: UserItemList[] = [
        { id: mockListId, name: 'Lista A', items: [] },
        { id: '22222222-3333-4444-5555-666666666666', name: 'Lista B', items: [] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    it('should call removeList in mutationFn', async () => {
        const options = useDeleteListMutationOptions();
        await options.mutationFn!(mockListId);
        expect(userItemListRepository.removeList).toHaveBeenCalledWith(mockListId);
    });

    it('should optimistically update cache in onMutate', async () => {
        mockQueryClient.getQueryData.mockReturnValue(mockPreviousLists);

        const context = await useDeleteListMutationOptions().onMutate!(mockListId);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            [userItemListsKey],
            [mockPreviousLists[1]] // Lista A fue eliminada
        );
        expect(context).toEqual({ previousLists: mockPreviousLists });
    });

    it('should rollback cache in onError if context is present', () => {
        const options = useDeleteListMutationOptions();
        options.onError!(
            new Error('fail'),
            mockListId,
            { previousLists: mockPreviousLists }
        );

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey], mockPreviousLists);
    });

    it('should invalidate query on success', () => {
        const options = useDeleteListMutationOptions();
        options.onSuccess!(
            { id: mockListId, name: 'Lista A', items: [] },
            mockListId,
            { previousLists: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
    });

    it('should invalidate query on settled', () => {
        const options = useDeleteListMutationOptions();
        options.onSettled!(
            undefined,
            null,
            mockListId,
            { previousLists: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
    });
});
