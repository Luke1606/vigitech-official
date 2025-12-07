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
	useCreateBatchSurveyItemsMutationOptions
} from './mutation-options';

export const useSurveyItemsAPI = () => {
	const useGetRecommendedQuery = useQuery(
		getRecommendedQueryOptions()
	);

	const useGetSubscribedQuery = useQuery(
		getSubscribedQueryOptions()
	);

	const useFindOneQuery = (itemId: UUID) => useQuery(
		findOneQueryOptions(itemId)
	);

	const useSubscribeOneMutation = useMutation(
		useSubscribeOneMutationOptions()
	);

	const useUnsubscribeOneMutation = useMutation(
		useUnsubscribeOneMutationOptions()
	);

	const useRemoveOneMutation = useMutation(
		useRemoveOneMutationOptions()
	);

	const useSubscribeBatchMutation = useMutation(
		useSubscribeBatchMutationOptions()
	);

	const useUnsubscribeBatchMutation = useMutation(
		useUnsubscribeBatchMutationOptions()
	);

	const useCreateSurveyItemMutation = useMutation(
		useCreateSurveyItemMutationOptions()
	);

	const useCreateBatchSurveyItemsMutation = useMutation(
		useCreateBatchSurveyItemsMutationOptions()
	);

	const useRemoveBatchMutation = useMutation(
		useRemoveBatchMutationOptions()
	);

	return {
		recommended: useGetRecommendedQuery,
		subscribed: useGetSubscribedQuery,
		findOne: useFindOneQuery,
		subscribeOne: useSubscribeOneMutation.mutate,
		unsubscribeOne: useUnsubscribeOneMutation.mutate,
		removeOne: useRemoveOneMutation.mutate,
		subscribeBatch: useSubscribeBatchMutation.mutate,
		unsubscribeBatch: useUnsubscribeBatchMutation.mutate,
		removeBatch: useRemoveBatchMutation.mutate,
		create: useCreateSurveyItemMutation.mutate,
		createBatch: useCreateBatchSurveyItemsMutation.mutate,
		isLoading: {
			subscribeOne: useSubscribeOneMutation.isPending,
			unsubscribeOne: useUnsubscribeOneMutation.isPending,
			removeOne: useRemoveOneMutation.isPending,
			subscribeBatch: useSubscribeBatchMutation.isPending,
			unsubscribeBatch: useUnsubscribeBatchMutation.isPending,
			removeBatch: useRemoveBatchMutation.isPending,
			create: useCreateSurveyItemMutation.isPending,
			createBatch: useCreateBatchSurveyItemsMutation.isPending,
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
		},
	};
};