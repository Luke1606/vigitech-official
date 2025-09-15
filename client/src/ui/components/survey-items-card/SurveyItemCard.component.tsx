import type { UUID } from "crypto";
import type React from "react";
import { Plus, Trash2, View } from "lucide-react";
import { type SurveyItemDto } from "@/infrastructure";
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardFooter, 
    Button
} from "@/ui/components";
import { CardVariant } from "./";

export const SurveyItemCard: React.FC<{
    key: UUID;
    item: SurveyItemDto
    variant: CardVariant
    selected: boolean
    onSelect: CallableFunction
    onUnselect: CallableFunction
    onSubscribe?: CallableFunction
    onUnsubscribe?: CallableFunction
    onRemove: CallableFunction
    onViewDetails: CallableFunction
    isLoading: {
        subscribeOne: boolean
        removeOne: boolean
    }
}> = ({
    key,
    item,
    variant,
    selected,
    onSelect,
    onUnselect,
    onSubscribe,
    onUnsubscribe,
    onRemove,
    onViewDetails,
    isLoading
}) => {
    if (variant === CardVariant.RECOMMENDED && !onSubscribe) return null;
    if (variant === CardVariant.SUBSCRIBED && !onUnsubscribe) return null;

    return (
        <Card 
            key={key} 
            className={`${selected? "caret-blue-800" : "caret-blue-100"}`}
            onClick={() => {
                if (selected) onUnselect();
                else onSelect();
            }}>
            <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                
                <CardDescription>{item.summary}</CardDescription>
            </CardHeader>
            
            <CardFooter>
                <Button
                    className="mr-2"
                    onClick={() => onViewDetails()}
                    disabled={isLoading.subscribeOne}>
                    <View className="w-4 h-4 mr-2" /> Details
                </Button>

                { variant === CardVariant.RECOMMENDED &&
                    <Button
                        className="mr-2"
                        onClick={() => onSubscribe()}
                        disabled={isLoading.subscribeOne}>
                        <Plus className="w-4 h-4 mr-2" /> Subscribe
                    </Button>}

                { variant === CardVariant.SUBSCRIBED &&
                    <Button
                        className="mr-2"
                        onClick={() => onUnsubscribe()}
                        disabled={isLoading.subscribeOne}>
                        <Plus className="w-4 h-4 mr-2" /> Unsubscribe
                    </Button>}
    
                <Button
                    variant="destructive"
                    onClick={() => onRemove()}
                    disabled={isLoading.removeOne}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
            </CardFooter>
        </Card>)
}