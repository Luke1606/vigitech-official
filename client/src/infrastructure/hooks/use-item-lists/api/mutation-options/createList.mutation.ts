import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';
import { useUserItemLists } from '../../../..';
import { error } from 'console';
import { findAllQueryOptions } from '../query-options';
import { toast } from 'react-toastify';

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
            console.log(_error);
            toast.error(`Error al crear la lista: ${_error}. Por favor haga una sincronización.`)
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
            toast.success("Se creó con éxito la lista.")     
        },
        
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};

