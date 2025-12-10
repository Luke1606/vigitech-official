// useSurveyItemsAPI.hook.ts
import type { UUID } from 'crypto';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	findOneQueryOptions,
	getRecommendedQueryOptions,
	getSubscribedQueryOptions
} from './query-options';
import {
	useSubscribeOneMutationOptions,
	useUnsubscribeOneMutationOptions,
	useRemoveOneMutationOptions,
	useSubscribeBatchMutationOptions,
	useUnsubscribeBatchMutationOptions,
	useRemoveBatchMutationOptions,
	useCreateSurveyItemMutationOptions,
	useCreateBatchSurveyItemsMutationOptions,
	useRunGlobalRecommendationsMutationOptions
} from './mutation-options';

export const useSurveyItemsAPI = () => {
	// Queries
	const useGetRecommendedQuery = useQuery(getRecommendedQueryOptions());
	const useGetSubscribedQuery = useQuery(getSubscribedQueryOptions());
	const useFindOneQuery = (itemId: UUID) => useQuery(findOneQueryOptions(itemId));

	// Mutations
	const useSubscribeOneMutation = useMutation(useSubscribeOneMutationOptions());
	const useUnsubscribeOneMutation = useMutation(useUnsubscribeOneMutationOptions());
	const useRemoveOneMutation = useMutation(useRemoveOneMutationOptions());
	const useSubscribeBatchMutation = useMutation(useSubscribeBatchMutationOptions());
	const useUnsubscribeBatchMutation = useMutation(useUnsubscribeBatchMutationOptions());
	const useRemoveBatchMutation = useMutation(useRemoveBatchMutationOptions());
	const useCreateSurveyItemMutation = useMutation(useCreateSurveyItemMutationOptions());
	const useCreateBatchSurveyItemsMutation = useMutation(useCreateBatchSurveyItemsMutationOptions());
	const useRunGlobalRecommendationsMutation = useMutation(useRunGlobalRecommendationsMutationOptions());

	return {
		// Queries
		recommended: useGetRecommendedQuery,
		subscribed: useGetSubscribedQuery,
		findOne: useFindOneQuery,

		// Mutation functions
		subscribeOne: useSubscribeOneMutation.mutate,
		unsubscribeOne: useUnsubscribeOneMutation.mutate,
		removeOne: useRemoveOneMutation.mutate,
		subscribeBatch: useSubscribeBatchMutation.mutate,
		unsubscribeBatch: useUnsubscribeBatchMutation.mutate,
		removeBatch: useRemoveBatchMutation.mutate,
		create: useCreateSurveyItemMutation.mutate,
		createBatch: useCreateBatchSurveyItemsMutation.mutate,
		runGlobalRecommendations: useRunGlobalRecommendationsMutation.mutate,

		// Full mutation objects (for state access)
		runGlobalRecommendationsMutation: useRunGlobalRecommendationsMutation,

		isLoading: {
			subscribeOne: useSubscribeOneMutation.isPending,
			unsubscribeOne: useUnsubscribeOneMutation.isPending,
			removeOne: useRemoveOneMutation.isPending,
			subscribeBatch: useSubscribeBatchMutation.isPending,
			unsubscribeBatch: useUnsubscribeBatchMutation.isPending,
			removeBatch: useRemoveBatchMutation.isPending,
			create: useCreateSurveyItemMutation.isPending,
			createBatch: useCreateBatchSurveyItemsMutation.isPending,
			runGlobalRecommendations: useRunGlobalRecommendationsMutation.isPending,
		},

		hasError: {
			subscribeOne: useSubscribeOneMutation.isError,
			unsubscribeOne: useUnsubscribeOneMutation.isError,
			removeOne: useRemoveOneMutation.isError,
			subscribeBatch: useSubscribeBatchMutation.isError,
			unsubscribeBatch: useUnsubscribeBatchMutation.isError,
			removeBatch: useRemoveBatchMutation.isError,
			create: useCreateSurveyItemMutation.isError,
			createBatch: useCreateBatchSurveyItemsMutation.isError,
			runGlobalRecommendations: useRunGlobalRecommendationsMutation.isError,
		},
	};
};