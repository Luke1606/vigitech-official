import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import type { SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

export const useAppendOneItemMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, itemId }: { listId: UUID; itemId: UUID }) =>
            userItemListRepository.appendOneItem(listId, itemId),

        onMutate: async ({ listId, itemId }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey, listId] });

            const previousList = queryClient.getQueryData<UserItemList>([userItemListsKey, listId]);

            if (previousList) {
                queryClient.setQueryData<UserItemList>([userItemListsKey, listId], {
                    ...previousList,
                    items: [...previousList.items, { id: itemId } as SurveyItem],
                });
            }

            return { previousList };
        },

        onError: (_error, { listId }, context) => {
            if (context?.previousList) {
                queryClient.setQueryData([userItemListsKey, listId], context.previousList);
            }
            console.log(_error)
            toast.error(`Error al añadir el elemento: ${_error}. Por favor haga una sincronización.`)
                                        
        },

        onSuccess: (_, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
            toast.success("Se añadieron con éxito el elemento.")     
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};