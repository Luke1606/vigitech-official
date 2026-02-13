// mutation-options.ts
import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto';
import { userItemListsKey } from '../constants';
import { SurveyItem, UserItemList, RadarQuadrant, RadarRing, InsightsValues } from '../../../..';
import { toast } from 'react-toastify';

export const useAppendAllItemsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: ({ listId, itemIds }: { listId: UUID; itemIds: UUID[] }) =>
            userItemListRepository.appendAllItems(listId, itemIds),

        onMutate: async ({ listId, itemIds }) => {
            await queryClient.cancelQueries({ queryKey: [userItemListsKey] });

            const previousLists = queryClient.getQueryData<UserItemList[]>([userItemListsKey]);

            if (previousLists) {
                // Actualización optimista
                const updatedLists = previousLists.map(list =>
                    list.id === listId
                        ? {
                            ...list,
                            items: [
                                ...list.items,
                                // Crear objetos SurveyItem temporales con todos los campos requeridos
                                ...itemIds.map(id => {
                                    const tempItem: SurveyItem = {
                                        id,
                                        title: 'Cargando...', // Placeholder temporal
                                        summary: '',
                                        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
                                        latestClassification: {
                                            id: '00000000-0000-0000-0000-000000000000' as UUID,
                                            analyzedAt: new Date().toISOString(),
                                            itemId: id,
                                            classification: RadarRing.ADOPT,
                                            insightsValues: {
                                                citedFragmentIds: [],
                                                insight: '',
                                                reasoningMetrics: {}
                                            } as InsightsValues
                                        },
                                        latestClassificationId: '00000000-0000-0000-0000-000000000000' as UUID,
                                        createdAt: new Date().toISOString(),
                                        insertedById: null,
                                        updatedAt: new Date().toISOString()
                                    };
                                    return tempItem;
                                })
                            ]
                        }
                        : list
                );
                queryClient.setQueryData([userItemListsKey], updatedLists);
            }

            return { previousLists };
        },

        onError: (_error, _, context) => {
            // Revertir cambios optimistas
            if (context?.previousLists) {
                queryClient.setQueryData([userItemListsKey], context.previousLists);
            }
            toast.error("Error al añadir los elementos a la lista.");
        },

        onSuccess: (updatedList) => {
            queryClient.setQueryData<UserItemList[]>([userItemListsKey], (old) =>
                old ? old.map(list => list.id === updatedList.id ? updatedList : list) : []
            );

            toast.success("Elementos añadidos exitosamente.");
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [userItemListsKey] });
        },
    });
};