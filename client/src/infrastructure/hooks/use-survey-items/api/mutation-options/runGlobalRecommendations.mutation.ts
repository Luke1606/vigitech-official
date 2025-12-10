import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

export const useRunGlobalRecommendationsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: () => surveyItemsRepository.runGlobalRecommendations(),

        onError: (error: Error, _variables) => {
            toast.error(`Error: ${error.message}`);
        },

        onSuccess: (data) => {
            // Invalida la query de recomendaciones para forzar un refetch
            queryClient.invalidateQueries({
                queryKey: [surveyItemsKey, 'recommended']
            });
            toast.success(data.message || "Recomendaciones generadas exitosamente.");
        },
    });
};

