import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItemDto } from "@/infrastructure";
import { surveyItemsKey, subscribedKey } from "../constants";

export const useUnsubscribeBatchMutationOptions = () => {
    const queryClient = useQueryClient();
    
    return mutationOptions({
		mutationFn: (
			itemIds: UUID[]
		) => surveyItemsRepository.unsubscribeBatch(itemIds),
		
		onMutate: async (
			itemIds: UUID[]
		) => {
			await queryClient.cancelQueries({ 
				queryKey: [
					surveyItemsKey, 
					subscribedKey
				] 
			});

			const previousSubscribed: SurveyItemDto[] | undefined = queryClient
				.getQueryData<SurveyItemDto[]>(
					[surveyItemsKey, subscribedKey]
				);

			queryClient.setQueryData<SurveyItemDto[]>(
				[surveyItemsKey, subscribedKey], 
				(old) => 
					old?.filter(
						(item: SurveyItemDto) => !itemIds.includes(item.id)
					) || []
			);

			return { previousSubscribed };
		},

		onError: (
			_err: Error, 
			_itemId: UUID[], 
			context: {
				previousSubscribed: SurveyItemDto[] | undefined;
			} | undefined
		) => {
			if (context?.previousSubscribed) {
				queryClient.setQueryData(
					[surveyItemsKey, subscribedKey], 
					context.previousSubscribed
				);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ 
				queryKey: [
					surveyItemsKey, 
					subscribedKey
				] 
			});
		},
	})
}