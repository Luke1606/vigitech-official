import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItem } from "../../../..";
import { surveyItemsKey, recommendedKey, subscribedKey } from "../constants";
import { toast } from "react-toastify";

export const useRemoveOneMutationOptions = () => {
    const queryClient = useQueryClient();
    
    return mutationOptions({
		mutationFn: (
			itemId: UUID
		) => surveyItemsRepository.removeOne(itemId),
		
		onMutate: async (
			itemId: UUID
		) => {
			await queryClient.cancelQueries({ 
				queryKey: [surveyItemsKey, recommendedKey] 
			});

			await queryClient.cancelQueries({ 
				queryKey: [surveyItemsKey, recommendedKey] 
			});

			const previousRecommendations: SurveyItem[] | undefined = queryClient
				.getQueryData<SurveyItem[]>(
					[surveyItemsKey, recommendedKey]
				);

			const previousSubscribed: SurveyItem[] | undefined = queryClient
				.getQueryData<SurveyItem[]>(
					[surveyItemsKey, subscribedKey]
				);

			queryClient.setQueryData<SurveyItem[]>(
				[surveyItemsKey, recommendedKey], 
				(old) => 
					old?.filter(item => item.id !== itemId) || []
			);

			queryClient.setQueryData<SurveyItem[]>(
				[surveyItemsKey, subscribedKey], 
				(old) => 
					old?.filter(item => item.id !== itemId) || []
			);

			return { previousRecommendations, previousSubscribed };
		},

		onError: (
			_err: Error, 
			_itemId: UUID, 
			context: {
				previousRecommendations: SurveyItem[] | undefined;
				previousSubscribed: SurveyItem[] | undefined;
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

			toast.error("Error al remover el elemento seleccionado. Compruebe su conexión o inténtelo de nuevo.")
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [
					surveyItemsKey,
					recommendedKey
				]
			});

			queryClient.invalidateQueries({
				queryKey: [
					surveyItemsKey,
					subscribedKey
				]
			});
			toast.success("Se removió con éxito el elemento.")
		},

		onSettled: () => {
			queryClient.invalidateQueries({ 
				queryKey: [
					surveyItemsKey, 
					recommendedKey
				] 
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