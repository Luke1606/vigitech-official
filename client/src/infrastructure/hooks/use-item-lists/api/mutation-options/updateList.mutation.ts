// useUpdateListMutationOptions.ts
import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';

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
            console.log(_error)
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};