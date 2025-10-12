import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItem } from "@/infrastructure";
import { surveyItemsKey, recommendedKey, subscribedKey } from "../constants";

export const useSubscribeOneMutationOptions = () => {
    const queryClient = useQueryClient();
    
    return mutationOptions({
        mutationFn: (
            itemId: UUID
        ) => surveyItemsRepository.subscribeOne(itemId),
        
        onMutate: async (
            itemId: UUID
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
                    old?.filter(
                        (item: SurveyItem) => item.id !== itemId
                    ) || []
            );

            const itemToAdd: SurveyItem | null = previousRecommendations?.find(
                (item: SurveyItem) => item.id === itemId
            ) || null;

            if (itemToAdd) {
                queryClient.setQueryData<SurveyItem[]>(
                    [surveyItemsKey, subscribedKey],
                    (old) => 
                        old ? [...old, itemToAdd] : [itemToAdd]
                );
            }

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