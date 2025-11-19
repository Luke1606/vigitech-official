// useUserItemListsAPI.hook.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import type { UUID } from 'crypto';

import {
    findOneQueryOptions,
    findAllQueryOptions,
} from './query-options';

import {
    useCreateListMutationOptions,
    useDeleteListMutationOptions,
    useAppendOneItemMutationOptions,
    useAppendAllItemsMutationOptions,
    useRemoveOneItemMutationOptions,
    useRemoveAllItemsMutationOptions,
    useUpdateListMutationOptions,
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

    const useUpdateListMutation = useMutation(
        useUpdateListMutationOptions() // Asegúrate de tener esta mutation
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
        // Usar mutateAsync en lugar de mutate para obtener Promises
        createList: useCreateListMutation.mutateAsync,
        deleteList: useDeleteListItemMutation.mutateAsync,
        updateList: useUpdateListMutation.mutateAsync, // Agregar esta línea
        appendOneItem: useAppendOneItemMutation.mutateAsync,
        appendAllItem: useAppendAllItemMutation.mutateAsync,
        removeOneItem: useRemoveOneItemMutation.mutateAsync,
        removeAllItem: useRemoveAllItemMutation.mutateAsync,
        isPending: {
            createList: useCreateListMutation.isPending,
            deleteList: useDeleteListItemMutation.isPending,
            updateList: useUpdateListMutation.isPending,
            appendOneItem: useAppendOneItemMutation.isPending,
            appendAllItem: useAppendAllItemMutation.isPending,
            removeOneItem: useRemoveOneItemMutation.isPending,
            removeAllItem: useRemoveAllItemMutation.isPending
        },
        hasError: {
            createList: useCreateListMutation.isError,
            deleteList: useDeleteListItemMutation.isError,
            updateList: useUpdateListMutation.isError,
            appendOneItem: useAppendOneItemMutation.isError,
            appendAllItem: useAppendAllItemMutation.isError,
            removeOneItem: useRemoveOneItemMutation.isError,
            removeAllItem: useRemoveAllItemMutation.isError
        },
    };
};