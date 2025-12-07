import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

export const useCreateBatchSurveyItemsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: (titles: string[]) => surveyItemsRepository.createBatch(titles),

        onError: (_error, _variables) => {
            toast.error("Error al añadir los elementos. Compruebe su conexión o inténtelo de nuevo.")
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [surveyItemsKey] });
            toast.success("Se añadieron con éxito los elementos.")
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [surveyItemsKey] });
        },
    });
};

