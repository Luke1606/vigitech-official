import type { UUID } from "crypto";
import type React from "react";
import type { SurveyItemDto } from "@/infrastructure";

export const SurveyItemCard: React.FC<{
    key: UUID;
    item: SurveyItemDto
    variant: "subscribed" | "unsubscribed"
    onUnsubscribe: CallableFunction
    onRemove: CallableFunction
    onViewDetails: CallableFunction
    isLoading: boolean
}> = ({
    key,
    item,
    variant,
    onUnsubscribe,
    onRemove,
    onViewDetails,
    isLoading
}) => {
    console.log(key, item, variant, onUnsubscribe, onRemove, onViewDetails, isLoading);
    return <>
    </>
}