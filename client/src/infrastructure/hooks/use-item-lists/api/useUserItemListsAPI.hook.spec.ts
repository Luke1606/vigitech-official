import { renderHook } from '@testing-library/react';
import { useUserItemListsAPI } from './useUserItemListsAPI.hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    findAllQueryOptions,
    findOneQueryOptions,
} from './query-options';
import {
    useCreateListMutationOptions,
    useDeleteListMutationOptions,
    useAppendOneItemMutationOptions,
    useAppendAllItemsMutationOptions,
    useRemoveOneItemMutationOptions,
    useRemoveAllItemsMutationOptions,
} from './mutation-options';
import { UUID } from '../../../domain';

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
}));

jest.mock('./query-options', () => ({
    findAllQueryOptions: jest.fn(),
    findOneQueryOptions: jest.fn(),
}));

jest.mock('./mutation-options', () => ({
    useCreateListMutationOptions: jest.fn(),
    useDeleteListMutationOptions: jest.fn(),
    useAppendOneItemMutationOptions: jest.fn(),
    useAppendAllItemsMutationOptions: jest.fn(),
    useRemoveOneItemMutationOptions: jest.fn(),
    useRemoveAllItemsMutationOptions: jest.fn(),
}));

const listId: UUID = '11111111-2222-3333-4444-555555555555';
const itemId: UUID = '55555555-4444-3333-2222-111111111111';

describe('useUserItemListsAPI', () => {
    const mockQueryResult = { data: ['mockList'], isLoading: false, isError: false };
    const mockMutationResult = {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useQuery as jest.Mock).mockReturnValue(mockQueryResult);
        (useMutation as jest.Mock).mockReturnValue(mockMutationResult);

        (findAllQueryOptions as jest.Mock).mockReturnValue({ queryKey: ['lists'] });
        (findOneQueryOptions as jest.Mock).mockReturnValue({ queryKey: ['list', 'id'] });

        (useCreateListMutationOptions as jest.Mock).mockReturnValue({ mutationKey: ['create'] });
        (useDeleteListMutationOptions as jest.Mock).mockReturnValue({ mutationKey: ['delete'] });
        (useAppendOneItemMutationOptions as jest.Mock).mockReturnValue({ mutationKey: ['appendOne'] });
        (useAppendAllItemsMutationOptions as jest.Mock).mockReturnValue({ mutationKey: ['appendAll'] });
        (useRemoveOneItemMutationOptions as jest.Mock).mockReturnValue({ mutationKey: ['removeOne'] });
        (useRemoveAllItemsMutationOptions as jest.Mock).mockReturnValue({ mutationKey: ['removeAll'] });
    });

    it('should expose findAll query result', () => {
        const { result } = renderHook(() => useUserItemListsAPI());
        expect(result.current.findAll).toEqual(mockQueryResult);
        expect(findAllQueryOptions).toHaveBeenCalled();
        expect(useQuery).toHaveBeenCalledWith({ queryKey: ['lists'] });
    });

    it('should expose findOne query function', () => {
        const { result } = renderHook(() => useUserItemListsAPI());
        const query = result.current.findOne(listId);
        expect(findOneQueryOptions).toHaveBeenCalledWith(listId);
        expect(useQuery).toHaveBeenCalledWith({ queryKey: ['list', 'id'] });
        expect(query).toEqual(mockQueryResult);
    });

    it('should expose mutation methods and status flags', () => {
        const { result } = renderHook(() => useUserItemListsAPI());

        result.current.createList('My List');
        result.current.deleteList(listId);
        result.current.appendOneItem({ listId, itemId });
        result.current.appendAllItem({ listId, itemIds: [itemId] });
        result.current.removeOneItem({ listId, itemId });
        result.current.removeAllItem({ listId, itemIds: [itemId] });


        expect(mockMutationResult.mutate).toHaveBeenCalledTimes(6);

        expect(result.current.isLoading).toEqual({
            createList: false,
            deleteList: false,
            appendOneItem: false,
            appendAllItem: false,
            removeOneItem: false,
            removeAllItem: false,
        });

        expect(result.current.hasError).toEqual({
            createList: false,
            deleteList: false,
            appendOneItem: false,
            appendAllItem: false,
            removeOneItem: false,
            removeAllItem: false,
        });
    });
});
