import { queryOptions } from "@tanstack/react-query";
import { surveyItemsRepository } from "@/infrastructure";
import { surveyItemsKey, recommendedKey } from "../constants";

export const getRecommendedQueryOptions = () => queryOptions({
	queryKey: [
		surveyItemsKey,
		recommendedKey
	],
	queryFn: () => surveyItemsRepository.findAllRecommended(),
});