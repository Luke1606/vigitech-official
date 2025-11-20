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

export const useRemoveOneItemMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, itemId }: { listId: UUID; itemId: UUID }) =>
            userItemListRepository.removeOneItem(listId, itemId),

        onMutate: async ({ listId, itemId }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey, listId] });

            const previousList = queryClient.getQueryData<UserItemList>([userItemListsKey, listId]);

            if (previousList) {
                queryClient.setQueryData<UserItemList>([userItemListsKey, listId], {
                    ...previousList,
                    items: previousList.items.filter(item => item.id !== itemId),
                });
            }

            return { previousList };
        },

        onError: (_error, { listId }, context) => {
            if (context?.previousList) {
                queryClient.setQueryData([userItemListsKey, listId], context.previousList);
            }
            //toast.error("Error al remover el elemento de la lista. Compruebe su conexión o inténtelo de nuevo.")
        },

        onSuccess: (_, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            toast.success("Se quitó con éxito el elemento de la lista.")
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};