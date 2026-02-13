import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItem } from "../../../..";
import { surveyItemsKey, recommendedKey, subscribedKey } from "../constants";
import { toast } from "react-toastify";

export const useSubscribeBatchMutationOptions = (
	onSuccessCleanup?: (subscribedIds: UUID[]) => void
) => {
	const queryClient = useQueryClient();

	return mutationOptions({
		mutationFn: (itemIds: UUID[]) =>
			surveyItemsRepository.subscribeBatch(itemIds),

		onMutate: async (itemIds) => {
			await queryClient.cancelQueries({ queryKey: [surveyItemsKey, recommendedKey] });
			await queryClient.cancelQueries({ queryKey: [surveyItemsKey, subscribedKey] });

			const previousRecommendations = queryClient.getQueryData<SurveyItem[]>([
				surveyItemsKey,
				recommendedKey,
			]);
			const previousSubscribed = queryClient.getQueryData<SurveyItem[]>([
				surveyItemsKey,
				subscribedKey,
			]);

			// Optimistic update: eliminar de recomendados
			queryClient.setQueryData<SurveyItem[]>(
				[surveyItemsKey, recommendedKey],
				(old) => old?.filter((item) => !itemIds.includes(item.id)) || []
			);

			// Optimistic update: agregar a suscritos
			const itemsToAdd = previousRecommendations?.filter((item) =>
				itemIds.includes(item.id)
			);
			if (itemsToAdd && itemsToAdd.length > 0) {
				queryClient.setQueryData<SurveyItem[]>(
					[surveyItemsKey, subscribedKey],
					(old) => (old ? [...old, ...itemsToAdd] : itemsToAdd)
				);
			}

			return { previousRecommendations, previousSubscribed };
		},

		onError: (_, __, context) => {
			if (context?.previousRecommendations) {
				queryClient.setQueryData(
					[surveyItemsKey, recommendedKey],
					context.previousRecommendations
				);
			}
			if (context?.previousSubscribed) {
				queryClient.setQueryData(
					[surveyItemsKey, subscribedKey],
					context.previousSubscribed
				);
			}
			toast.error('Error al suscribirse a los elementos seleccionados.');
		},

		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, recommendedKey] });
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, subscribedKey] });
			toast.success('Se suscribió con éxito a los elementos.');

			onSuccessCleanup?.(variables);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, recommendedKey] });
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, subscribedKey] });
		},
	});
};