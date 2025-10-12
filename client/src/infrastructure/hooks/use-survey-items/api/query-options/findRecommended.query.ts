import { queryOptions } from "@tanstack/react-query";
import { surveyItemsRepository } from "@/infrastructure";
import { surveyItemsKey, recommendedKey } from "../constants";

export const findRecommendedQueryOptions = () => queryOptions({
	queryKey: [
		surveyItemsKey,
		recommendedKey
	],
	queryFn: () => surveyItemsRepository.findAllRecommended(),
});