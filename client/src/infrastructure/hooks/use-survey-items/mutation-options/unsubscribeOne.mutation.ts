import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItemDto } from "@/infrastructure";
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

			const previousSubscribed: SurveyItemDto[] | undefined = queryClient
				.getQueryData<SurveyItemDto[]>(
					[surveyItemsKey, subscribedKey]
				);

			queryClient.setQueryData<SurveyItemDto[]>(
				[surveyItemsKey, subscribedKey], 
				(old) => 
					old?.filter(
						(item: SurveyItemDto) => item.id !== itemId) || []
			);
			return { previousSubscribed };
		},

		onError: (
			_err: Error, 
			_itemId: UUID, 
			context:  {
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