import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '@/infrastructure';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '@/infrastructure';

export const useCreateListMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: (listName: string) => userItemListRepository.createList(listName),

        onMutate: async (listName: string) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey] });

            const previousLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);

            const optimisticList: UserItemList = {
                id: crypto.randomUUID() as any, // temporal ID
                name: listName,
                items: [],
            };

            if (previousLists) {
                queryClient.setQueryData<UserItemList[]>([userItemListsKey], [
                    ...previousLists,
                    optimisticList,
                ]);
            }

            return { previousLists };
        },

        onError: (_error, _variables, context) => {
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

