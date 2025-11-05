import type { UUID } from 'crypto';
import {
    mutationOptions,
    useQueryClient
} from '@tanstack/react-query';
import {
    userItemListRepository,
    type UserItemList
} from '../../../..';
import { userItemListsKey } from '../constants';
import { toast } from 'react-toastify';

export const useRemoveAllItemsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, itemIds }: { listId: UUID; itemIds: UUID[] }) =>
            userItemListRepository.removeAllItems(listId, itemIds),

        onMutate: async ({ listId, itemIds }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey, listId] });

            const previousList = queryClient.getQueryData<UserItemList>([userItemListsKey, listId]);

            if (previousList) {
                queryClient.setQueryData<UserItemList>([userItemListsKey, listId], {
                    ...previousList,
                    items: previousList.items.filter(item => !itemIds.includes(item.id)),
                });
            }

            return { previousList };
        },

        onError: (_error, { listId }, context) => {
            if (context?.previousList) {
                queryClient.setQueryData([userItemListsKey, listId], context.previousList);
            }
            console.log(_error)
            toast.error(`Error al quitar los elementos de la lista: ${_error}. Por favor haga una sincronización.`)
        },

        onSuccess: (_, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            toast.success("Se quitaron con éxito los elementos de la lista.")     
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};
