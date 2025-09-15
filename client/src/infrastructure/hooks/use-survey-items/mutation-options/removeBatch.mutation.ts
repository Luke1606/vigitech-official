import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItemDto } from "@/infrastructure";
import { surveyItemsKey, recommendedKey, subscribedKey } from "../constants";

export const useRemoveBatchMutationOptions = () => {
    const queryClient = useQueryClient();
    
    return mutationOptions({
		mutationFn: (
			itemIds: UUID[]
		) => surveyItemsRepository.removeBatch(itemIds),
		
		onMutate: async (
			itemIds: UUID[]
		) => {
			await queryClient.cancelQueries({ 
				queryKey: [
					surveyItemsKey, 
					recommendedKey
				] 
			});

			await queryClient.cancelQueries({ 
				queryKey: [
					surveyItemsKey, 
					subscribedKey
				] 
			});

			const previousRecommendations: SurveyItemDto[] | undefined = queryClient
				.getQueryData<SurveyItemDto[]>(
					[surveyItemsKey, recommendedKey]
				);

			const previousSubscribed: SurveyItemDto[] | undefined = queryClient
				.getQueryData<SurveyItemDto[]>(
					[surveyItemsKey, subscribedKey]
				);

			queryClient.setQueryData<SurveyItemDto[]>(
				[surveyItemsKey, recommendedKey], 
				(old) => 
					old?.filter(
						(item: SurveyItemDto) => !itemIds.includes(item.id)
					) || []
			);

			queryClient.setQueryData<SurveyItemDto[]>(
				[surveyItemsKey, subscribedKey], 
				(old) => 
					old?.filter(
						(item: SurveyItemDto) => !itemIds.includes(item.id)
					) || []
			);

			return { previousRecommendations, previousSubscribed };
		},

		onError: (
			_err: Error, 
			_itemIds: UUID[], 
			context: {
				previousRecommendations: SurveyItemDto[] | undefined;
				previousSubscribed: SurveyItemDto[] | undefined;
			} | undefined
		) => {
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
		},

		onSettled: () => {
			queryClient.invalidateQueries({ 
				queryKey: [surveyItemsKey, recommendedKey] 
			});

			queryClient.invalidateQueries({ 
				queryKey: [
					surveyItemsKey, 
					subscribedKey
				]
			});
		},
	})
}