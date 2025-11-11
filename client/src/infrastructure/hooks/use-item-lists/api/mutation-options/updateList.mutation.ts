// useUpdateListMutationOptions.ts
import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';
import { toast } from 'react-toastify';

export const useUpdateListMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, listNewName }: { listId: UUID; listNewName: string }) =>
            userItemListRepository.updateList(listId, listNewName),

        onMutate: async ({ listId, listNewName }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey] });

            const previousLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);

            if (previousLists) {
                queryClient.setQueryData<UserItemList[]>(
                    [userItemListsKey],
                    previousLists.map(list =>
                        list.id === listId
                            ? {
                                ...list,
                                name: listNewName,
                                updatedAt: new Date().toISOString()
                            }
                            : list
                    )
                );
            }

            return { previousLists };
        },

        onError: (_error, _variables, context) => {
            if (context?.previousLists) {
                queryClient.setQueryData([userItemListsKey], context.previousLists);
            }

            toast.error("Error al renombrar la lista. Compruebe su conexión o inténtelo de nuevo.")
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
            toast.success("Se renombró con éxito la lista.")
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};