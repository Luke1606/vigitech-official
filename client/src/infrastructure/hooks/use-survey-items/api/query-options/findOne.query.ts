import type { UUID } from "crypto";
import { queryOptions } from "@tanstack/react-query";
import { surveyItemsRepository } from "../../../..";
import { surveyItemsKey } from "../constants";

export const findOneQueryOptions = (itemId: UUID) => queryOptions({
    queryKey: [
        surveyItemsKey, 
        itemId
    ],
    queryFn: () => surveyItemsRepository.findOne(itemId),
    enabled: !!itemId,
})