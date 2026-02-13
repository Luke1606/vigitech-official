import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItem } from "../../../..";
import { surveyItemsKey, recommendedKey, subscribedKey } from "../constants";
import { toast } from "react-toastify";

export const useRemoveBatchMutationOptions = (
	onSuccessCleanup?: (removedIds: UUID[]) => void
) => {
	const queryClient = useQueryClient();

	return mutationOptions({
		mutationFn: (itemIds: UUID[]) => surveyItemsRepository.removeBatch(itemIds),

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

			// Optimistic update: eliminar de ambas listas
			queryClient.setQueryData<SurveyItem[]>(
				[surveyItemsKey, recommendedKey],
				(old) => old?.filter((item) => !itemIds.includes(item.id)) || []
			);
			queryClient.setQueryData<SurveyItem[]>(
				[surveyItemsKey, subscribedKey],
				(old) => old?.filter((item) => !itemIds.includes(item.id)) || []
			);

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
			toast.error('Error al eliminar los elementos.');
		},

		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, recommendedKey] });
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, subscribedKey] });
			toast.success('Elementos eliminados correctamente.');

			onSuccessCleanup?.(variables);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, recommendedKey] });
			queryClient.invalidateQueries({ queryKey: [surveyItemsKey, subscribedKey] });
		},
	});
};