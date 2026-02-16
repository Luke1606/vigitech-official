import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

export const useRunAllReclassificationsMutationOptions = () => {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: () => surveyItemsRepository.runAllReclassifications(),

        onError: (_variables) => {
            toast.error(`Error al reclasificar los elementos. Inténtelo de nuevo o compruebe su conexión.`);
        },

        onSuccess: (data) => {
            // Verificar si el array está vacío
            if (Array.isArray(data) && data.length === 0) {
                toast.info("No se encontraron cambios en los elementos.");
            } else {
                toast.success("Elementos reclasificados exitosamente.");
            }

            // Invalidar las queries para refrescar la lista
            queryClient.invalidateQueries({
                queryKey: [surveyItemsKey]
            });
        },
    });
};