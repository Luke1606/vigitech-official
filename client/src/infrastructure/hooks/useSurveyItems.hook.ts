// hooks/useSurveyItems.ts
import type { UUID } from 'crypto';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyItemsRepository, type SurveyItemDto } from '@/infrastructure';

export const useSurveyItems = () => {
	const queryClient = useQueryClient();

	const getRecommendedQuery = useQuery({
		queryKey: ['surveyItems', 'recommendations'],
		queryFn: () => surveyItemsRepository.findAllRecommended(),
	});

	const getSubscribedQuery = useQuery({
		queryKey: ['surveyItems', 'subscribed'],
		queryFn: () => surveyItemsRepository.findAllSubscribed(),
	});

	const findOneQuery = (itemId: UUID) => 
		useQuery({
			queryKey: ['surveyItems', itemId],
			queryFn: () => surveyItemsRepository.findOne(itemId),
			enabled: !!itemId,
		});

	const subscribeOneMutation = useMutation({
		mutationFn: (itemId: UUID) => surveyItemsRepository.subscribeOne(itemId),
		onMutate: async (itemId) => {

			await queryClient.cancelQueries({ queryKey: ['surveyItems', 'recommendations'] });
			await queryClient.cancelQueries({ queryKey: ['surveyItems', 'subscribed'] });

			const previousRecommendations = queryClient.getQueryData<SurveyItemDto[]>(['surveyItems', 'recommendations']);
			const previousSubscribed = queryClient.getQueryData<SurveyItemDto[]>(['surveyItems', 'subscribed']);

			queryClient.setQueryData<SurveyItemDto[]>(['surveyItems', 'recommendations'], (old) => 
				old?.filter(item => item.id !== itemId) || []
			);

			const itemToAdd = previousRecommendations?.find(item => item.id === itemId);
			if (itemToAdd) {
				queryClient.setQueryData<SurveyItemDto[]>(
					['surveyItems', 'subscribed'],
					(old) => 
						old ? [...old, itemToAdd] : [itemToAdd]
				);
			}

			return { previousRecommendations, previousSubscribed };
		},

		onError: (err, itemId, context) => {
		// Revert the optimistic updates
		if (context?.previousRecommendations) {
			queryClient.setQueryData(['surveyItems', 'recommendations'], context.previousRecommendations);
		}
		if (context?.previousSubscribed) {
			queryClient.setQueryData(['surveyItems', 'subscribed'], context.previousSubscribed);
		}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['surveyItems', 'recommendations'] });
			queryClient.invalidateQueries({ queryKey: ['surveyItems', 'subscribed'] });
		},
	});

	const unsubscribeOneMutation = useMutation({
		mutationFn: (itemId: UUID) => surveyItemsRepository.unsubscribeOne(itemId),
		onMutate: async (itemId) => {
		await queryClient.cancelQueries({ queryKey: ['surveyItems', 'subscribed'] });
		const previousSubscribed = queryClient.getQueryData<SurveyItemDto[]>(['surveyItems', 'subscribed']);
		queryClient.setQueryData<SurveyItemDto[]>(['surveyItems', 'subscribed'], (old) => 
			old?.filter(item => item.id !== itemId) || []
		);
		return { previousSubscribed };
		},
		onError: (err, itemId, context) => {
		if (context?.previousSubscribed) {
			queryClient.setQueryData(['surveyItems', 'subscribed'], context.previousSubscribed);
		}
		},
		onSettled: () => {
		queryClient.invalidateQueries({ queryKey: ['surveyItems', 'subscribed'] });
		},
	});

	const removeMutation = useMutation({
		mutationFn: (itemId: UUID) => surveyItemsRepository.removeOne(itemId),
		onMutate: async (itemId) => {
		// Para remove, podemos querer quitarlo de ambas listas: recommendations y subscribed
		await queryClient.cancelQueries({ queryKey: ['surveyItems', 'recommendations'] });
		await queryClient.cancelQueries({ queryKey: ['surveyItems', 'subscribed'] });

		const previousRecommendations = queryClient.getQueryData<SurveyItemDto[]>(['surveyItems', 'recommendations']);
		const previousSubscribed = queryClient.getQueryData<SurveyItemDto[]>(['surveyItems', 'subscribed']);

		queryClient.setQueryData<SurveyItemDto[]>(['surveyItems', 'recommendations'], (old) => 
			old?.filter(item => item.id !== itemId) || []
		);
		queryClient.setQueryData<SurveyItemDto[]>(['surveyItems', 'subscribed'], (old) => 
			old?.filter(item => item.id !== itemId) || []
		);

		return { previousRecommendations, previousSubscribed };
		},
		onError: (err, itemId, context) => {
		if (context?.previousRecommendations) {
			queryClient.setQueryData(['surveyItems', 'recommendations'], context.previousRecommendations);
		}
		if (context?.previousSubscribed) {
			queryClient.setQueryData(['surveyItems', 'subscribed'], context.previousSubscribed);
		}
		},
		onSettled: () => {
		queryClient.invalidateQueries({ queryKey: ['surveyItems', 'recommendations'] });
		queryClient.invalidateQueries({ queryKey: ['surveyItems', 'subscribed'] });
		},
	});

	return {
		recommendations: getRecommendedQuery,
		subscribed: getSubscribedQuery,
		findOne: findOneQuery,
		subscribe: subscribeOneMutation.mutate,
		unsubscribe: unsubscribeOneMutation.mutate,
		remove: removeMutation.mutate,
		isLoading: {
		subscribe: subscribeOneMutation.isPending,
		unsubscribe: unsubscribeOneMutation.isPending,
		remove: removeMutation.isPending,
		},
	};
};