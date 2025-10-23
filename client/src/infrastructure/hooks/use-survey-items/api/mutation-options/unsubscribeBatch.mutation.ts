import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItem } from "../../../..";
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

			const previousSubscribed: SurveyItem[] | undefined = queryClient
				.getQueryData<SurveyItem[]>(
					[surveyItemsKey, subscribedKey]
				);

			queryClient.setQueryData<SurveyItem[]>(
				[surveyItemsKey, subscribedKey], 
				(old) => 
					old?.filter(
						(item: SurveyItem) => !itemIds.includes(item.id)
					) || []
			);

			return { previousSubscribed };
		},

		onError: (
			_err: Error, 
			_itemId: UUID[], 
			context: {
				previousSubscribed: SurveyItem[] | undefined;
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