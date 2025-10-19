import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '@/infrastructure';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '@/infrastructure';

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
                    items: [...previousList.items, { id: itemId } as any], // puedes usar un stub de SurveyItem si no tienes el objeto completo
                });
            }

            return { previousList };
        },

        onError: (_error, { listId }, context) => {
            if (context?.previousList) {
                queryClient.setQueryData([userItemListsKey, listId], context.previousList);
            }
        },

        onSuccess: (_, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};

export const useAppendAllItemsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, itemIds }: { listId: UUID; itemIds: UUID[] }) =>
            userItemListRepository.appendAllItems(listId, itemIds),

        onMutate: async ({ listId, itemIds }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey, listId] });

            const previousList = queryClient.getQueryData<UserItemList>([userItemListsKey, listId]);

            if (previousList) {
                const newItems = itemIds.map(id => ({ id } as any)); // stub de SurveyItem si no tienes el objeto completo

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
        },

        onSuccess: (_, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },

        onSettled: (_data, _error, { listId }) => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey, listId] });
        },
    });
};

