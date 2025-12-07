import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

export const useCreateSurveyItemMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: (title: string) => surveyItemsRepository.create(title),

        onError: (_error, _variables) => {
            toast.error("Error al añadir el elemento. Compruebe su conexión o inténtelo de nuevo.")
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [surveyItemsKey] });
            toast.success("Se añadió con éxito el elemento.")
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [surveyItemsKey] });
        },
    });
};

