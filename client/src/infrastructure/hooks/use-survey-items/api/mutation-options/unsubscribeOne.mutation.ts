import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItem } from "../../../..";
import { surveyItemsKey, subscribedKey } from "../constants";

export const useUnsubscribeOneMutationOptions = () => {
    const queryClient = useQueryClient();
    
    return mutationOptions({
		mutationFn: (
			itemId: UUID
		) => surveyItemsRepository.unsubscribeOne(itemId),
		
		onMutate: async (itemId) => {
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
						(item: SurveyItem) => item.id !== itemId) || []
			);
			return { previousSubscribed };
		},

		onError: (
			_err: Error, 
			_itemId: UUID, 
			context:  {
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