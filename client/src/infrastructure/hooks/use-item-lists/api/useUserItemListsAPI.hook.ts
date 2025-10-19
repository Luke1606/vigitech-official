import type { UUID } from 'crypto';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
    findOneQueryOptions,
    findAllQueryOptions,
} from './query-options';

import {
    useAppendAllItemsMutationOptions,
    useAppendOneItemMutationOptions,
    useCreateListMutationOptions,
    useDeleteListMutationOptions,
    useRemoveAllItemsMutationOptions,
    useRemoveOneItemMutationOptions
} from './mutation-options';

export const useUserItemListsAPI = () => {

    const useFindAllListsQuery = useQuery(
        findAllQueryOptions()
    );

    const useFindOneListQuery = (listId: UUID) => useQuery(
        findOneQueryOptions(listId)
    );

    const useCreateListMutation = useMutation(
        useCreateListMutationOptions()
    );

    const useDeleteListItemMutation = useMutation(
        useDeleteListMutationOptions()
    );

    const useAppendAllItemMutation = useMutation(
        useAppendAllItemsMutationOptions()
    );

    const useAppendOneItemMutation = useMutation(
        useAppendOneItemMutationOptions()
    );

    const useRemoveAllItemMutation = useMutation(
        useRemoveAllItemsMutationOptions()
    );

    const useRemoveOneItemMutation = useMutation(
        useRemoveOneItemMutationOptions()
    );

    return {
        findOne: useFindOneListQuery,
        findAll: useFindAllListsQuery,
        createList: useCreateListMutation.mutate,
        deleteList: useDeleteListItemMutation.mutate,
        appendOneItem: useAppendOneItemMutation.mutate,
        appendAllItem: useAppendAllItemMutation.mutate,
        removeOneItem: useRemoveOneItemMutation.mutate,
        removeAllItem: useRemoveAllItemMutation.mutate,
        isLoading: {
            createList: useCreateListMutation.isPending,
            deleteList: useDeleteListItemMutation.isPending,
            appendOneItem: useAppendOneItemMutation.isPending,
            appendAllItem: useAppendAllItemMutation.isPending,
            removeOneItem: useRemoveOneItemMutation.isPending,
            removeAllItem: useRemoveAllItemMutation.isPending
        },
        hasError: {
            createList: useCreateListMutation.isError,
            deleteList: useDeleteListItemMutation.isError,
            appendOneItem: useAppendOneItemMutation.isError,
            appendAllItem: useAppendAllItemMutation.isError,
            removeOneItem: useRemoveOneItemMutation.isError,
            removeAllItem: useRemoveAllItemMutation.isError
        },
    };
};