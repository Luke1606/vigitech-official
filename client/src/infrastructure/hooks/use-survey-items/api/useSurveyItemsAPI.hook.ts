import type { UUID } from 'crypto';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	findOneQueryOptions,
	getRecommendedQueryOptions,
	getSubscribedQueryOptions,
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
	useRunGlobalRecommendationsMutationOptions,
} from './mutation-options';

// ----------------------------------------------------------------------
// Tipado para las opciones del hook (solo batch por ahora)
// ----------------------------------------------------------------------
export type SurveyItemsAPIOptions = {
	onSubscribeBatchSuccess?: (subscribedIds: UUID[]) => void;
	onRemoveBatchSuccess?: (removedIds: UUID[]) => void;
	// Si necesitas limpieza en otras mutaciones, añádelas aquí
};

// ----------------------------------------------------------------------
// Hook principal
// ----------------------------------------------------------------------
export const useSurveyItemsAPI = (options: SurveyItemsAPIOptions = {}) => {
	// ----------------------------------------------------------------
	// Queries
	// ----------------------------------------------------------------
	const useGetRecommendedQuery = useQuery(getRecommendedQueryOptions());
	const useGetSubscribedQuery = useQuery(getSubscribedQueryOptions());
	const useFindOneQuery = (itemId: UUID) =>
		useQuery(findOneQueryOptions(itemId));

	// ----------------------------------------------------------------
	// Mutations individuales (sin cambios)
	// ----------------------------------------------------------------
	const useSubscribeOneMutation = useMutation(useSubscribeOneMutationOptions());
	const useUnsubscribeOneMutation = useMutation(
		useUnsubscribeOneMutationOptions()
	);
	const useRemoveOneMutation = useMutation(useRemoveOneMutationOptions());
	const useUnsubscribeBatchMutation = useMutation(
		useUnsubscribeBatchMutationOptions()
	);
	const useCreateSurveyItemMutation = useMutation(
		useCreateSurveyItemMutationOptions()
	);
	const useCreateBatchSurveyItemsMutation = useMutation(
		useCreateBatchSurveyItemsMutationOptions()
	);
	const useRunGlobalRecommendationsMutation = useMutation(
		useRunGlobalRecommendationsMutationOptions()
	);

	// ----------------------------------------------------------------
	// Mutaciones BATCH - con callbacks de limpieza inyectados
	// ----------------------------------------------------------------
	const useSubscribeBatchMutation = useMutation(
		useSubscribeBatchMutationOptions(options.onSubscribeBatchSuccess)
	);
	const useRemoveBatchMutation = useMutation(
		useRemoveBatchMutationOptions(options.onRemoveBatchSuccess)
	);

	// ----------------------------------------------------------------
	// Retorno del hook
	// ----------------------------------------------------------------
	return {
		// ----- Queries -----
		recommended: useGetRecommendedQuery,
		subscribed: useGetSubscribedQuery,
		findOne: useFindOneQuery,

		// ----- Funciones mutate -----
		subscribeOne: useSubscribeOneMutation.mutate,
		unsubscribeOne: useUnsubscribeOneMutation.mutate,
		removeOne: useRemoveOneMutation.mutate,
		subscribeBatch: useSubscribeBatchMutation.mutate,
		unsubscribeBatch: useUnsubscribeBatchMutation.mutate,
		removeBatch: useRemoveBatchMutation.mutate,
		create: useCreateSurveyItemMutation.mutate,
		createBatch: useCreateBatchSurveyItemsMutation.mutate,
		runGlobalRecommendations: useRunGlobalRecommendationsMutation.mutate,

		// ----- Objetos completos de mutación (acceso a estados) -----
		runGlobalRecommendationsMutation: useRunGlobalRecommendationsMutation,

		// ----- Estados de carga -----
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

		// ----- Estados de error -----
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