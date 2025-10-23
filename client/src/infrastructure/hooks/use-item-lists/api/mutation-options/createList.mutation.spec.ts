import { useCreateListMutationOptions } from './createList.mutation';
import { userItemListRepository } from '../../../..';
import { useQueryClient } from '@tanstack/react-query';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';

jest.mock('../../../..', () => ({
    userItemListRepository: {
        createList: jest.fn(),
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

describe('useCreateListMutationOptions', () => {
    const mockListName = 'Nueva Lista';
    const mockQueryClient = {
        cancelQueries: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
    };

    const mockPreviousLists: UserItemList[] = [
        { id: '11111111-2222-3333-4444-555555555555', name: 'Lista A', items: [] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    it('should call createList in mutationFn', async () => {
        const options = useCreateListMutationOptions();
        await options.mutationFn!(mockListName);
        expect(userItemListRepository.createList).toHaveBeenCalledWith(mockListName);
    });

    it('should optimistically update cache in onMutate', async () => {
        mockQueryClient.getQueryData.mockReturnValue(mockPreviousLists);

        const context = await useCreateListMutationOptions().onMutate!(mockListName);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            [userItemListsKey],
            expect.arrayContaining([
                ...mockPreviousLists,
                expect.objectContaining({ name: mockListName }),
            ])
        );
        expect(context).toEqual({ previousLists: mockPreviousLists });
    });

    it('should rollback cache in onError if context is present', () => {
        const options = useCreateListMutationOptions();
        options.onError!(
            new Error('fail'),
            mockListName,
            { previousLists: mockPreviousLists }
        );

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey], mockPreviousLists);
    });

    it('should invalidate query on success', () => {
        const options = useCreateListMutationOptions();
        options.onSuccess!(
            { id: 'temp-id', name: mockListName, items: [] },
            mockListName,
            { previousLists: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
    });

    it('should invalidate query on settled', () => {
        const options = useCreateListMutationOptions();
        options.onSettled!(
            undefined,
            null,
            mockListName,
            { previousLists: undefined }
        );

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
    });
});
