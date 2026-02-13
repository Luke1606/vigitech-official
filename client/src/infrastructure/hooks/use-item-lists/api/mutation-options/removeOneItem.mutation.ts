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
                            items: list.items.filter(item => item.id !== itemId)
                        }
                        : list
                );

                queryClient.setQueryData<UserItemList[]>([userItemListsKey], updatedLists);
            }

            return { previousLists };
        },

        onError: (error, _, context) => {
            console.error("Error removiendo elemento:", error);

            // Revertir al estado anterior
            if (context?.previousLists) {
                queryClient.setQueryData([userItemListsKey], context.previousLists);
            }

            toast.error("Error al remover el elemento de la lista. Compruebe su conexión o inténtelo de nuevo.");
        },

        onSuccess: (_, { listId, itemId }) => {
            console.log("Elemento removido exitosamente:", { listId, itemId });

            // Invalidar ambas queries para forzar refetch
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });

            toast.success("Se quitó con éxito el elemento de la lista.");
        },

        onSettled: (_data, _error, { listId }) => {
            // Invalidar siempre al final
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};