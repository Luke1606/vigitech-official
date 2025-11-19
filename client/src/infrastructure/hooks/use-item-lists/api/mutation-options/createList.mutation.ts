import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';
import { toast } from 'react-toastify';

export const useCreateListMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: (listName: string) => userItemListRepository.createList(listName),

        onMutate: async (listName: string) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey] });

            const previousLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);

            const optimisticList: UserItemList = {
                id: crypto.randomUUID() as any,
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
            //toast.error("Error al crear la lista. Compruebe su conexión o inténtelo de nuevo.")
            console.log(_error)
        },

        onSuccess: () => {
            toast.success("Se creó con éxito la lista.")
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};

