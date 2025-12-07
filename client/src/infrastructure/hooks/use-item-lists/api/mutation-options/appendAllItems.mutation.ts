import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import type { SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

export const useAppendAllItemsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, itemIds }: { listId: UUID; itemIds: UUID[] }) =>
            userItemListRepository.appendAllItems(listId, itemIds),

        onMutate: async ({ listId, itemIds }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey, listId] });

            const previousList = queryClient.getQueryData<UserItemList>([userItemListsKey, listId]);

            if (previousList) {
                const newItems = itemIds.map(id => ({ id } as SurveyItem));

                queryClient.setQueryData<UserItemList>([userItemListsKey, listId], {
                    ...previousList,
                    items: [...previousList.items, ...newItems],
                });
            }

            return { previousList };
        },

        onError: (_error, { listId }, context) => {
            if (context?.previousList) {
                queryClient.setQueryData([userItemListsKey, listId], context.previousList);
            }
            toast.error("Error al añadir los elementos a la lista. Compruebe su conexión o inténtelo de nuevo.")
        },

        onSuccess: () => {
            toast.success("Se añadieron con éxito los elementos.")                                 
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};

