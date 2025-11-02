import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';

export const useDeleteListMutationOptions = () => {

    const queryClient = useQueryClient();
    

    return mutationOptions({
        mutationFn: (listId: UUID) => userItemListRepository.removeList(listId),

        onMutate: async (listId: UUID) => {
            const previousLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);
            await queryClient.cancelQueries({ queryKey: [userItemListsKey] });

            if (previousLists) {
                queryClient.setQueryData<UserItemList[]>(
                    [userItemListsKey],
                    previousLists.filter(list => list.id !== listId)
                );
            }

            return { previousLists };

        },

        onError: (_error, _listId, context) => {
            if (context?.previousLists) {
                queryClient.setQueryData([userItemListsKey], context.previousLists);
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};

