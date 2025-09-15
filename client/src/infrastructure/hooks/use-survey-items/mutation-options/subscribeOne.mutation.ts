import type { UUID } from "crypto";
import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { surveyItemsRepository, type SurveyItemDto } from "@/infrastructure";
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
                        (item: SurveyItemDto) => item.id !== itemId
                    ) || []
            );

            const itemToAdd: SurveyItemDto | null = previousRecommendations?.find(
                (item: SurveyItemDto) => item.id === itemId
            ) || null;

            if (itemToAdd) {
                queryClient.setQueryData<SurveyItemDto[]>(
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