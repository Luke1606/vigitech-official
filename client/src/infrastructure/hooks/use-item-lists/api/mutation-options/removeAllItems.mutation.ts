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
            // Cancelar queries en curso
            await queryClient.cancelQueries({ queryKey: [userItemListsKey, listId] });
            await queryClient.cancelQueries({ queryKey: [userItemListsKey] });

            const previousLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);

            if (previousLists) {
                // Optimistic update en todas las listas
                const updatedLists = previousLists.map(list =>
                    list.id === listId
                        ? {
                            ...list,
                            items: list.items.filter(item => !itemIds.includes(item.id))
                        }
                        : list
                );

                queryClient.setQueryData<UserItemList[]>([userItemListsKey], updatedLists);
            }

            return { previousLists };
        },

        onError: (error, _, context) => {
            console.error("Error removiendo elementos:", error);

            // Revertir al estado anterior
            if (context?.previousLists) {
                queryClient.setQueryData([userItemListsKey], context.previousLists);
            }

            toast.error("Error al remover los elementos de la lista. Compruebe su conexión o inténtelo de nuevo.");
        },

        onSuccess: (updatedList, { listId, itemIds }) => {
            console.log("Elementos removidos exitosamente:", {
                listId,
                itemsRemoved: itemIds.length,
                remainingItems: updatedList.items.length
            });

            // Invalidar ambas queries para forzar refetch
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });

            toast.success(`Se quitaron ${itemIds.length} elemento(s) de la lista.`);
        },

        onSettled: (_data, _error, { listId }) => {
            // Invalidar siempre al final
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};