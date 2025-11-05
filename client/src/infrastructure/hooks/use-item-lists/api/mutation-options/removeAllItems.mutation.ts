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
        },

        onSuccess: (_, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};
