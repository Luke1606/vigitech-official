import type { UUID } from "crypto";
import type React from "react";
import { Plus, Trash2, View } from "lucide-react";
import { type SurveyItem } from "../../../../../infrastructure";
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardFooter, 
    Button
} from "../../..";

export const SurveyItemCard: React.FC<{
    key: UUID;
    item: SurveyItem
    selected: boolean
    onSelect: CallableFunction
    onUnselect: CallableFunction
    onSubscribe: CallableFunction
    onRemove: CallableFunction
    onViewDetails: CallableFunction
    isLoading: {
        subscribeOne: boolean
        removeOne: boolean
    }
}> = ({
    key,
    item,
    selected,
    onSelect,
    onUnselect,
    onSubscribe,
    onRemove,
    onViewDetails,
    isLoading
}) => {

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
                    <View className="w-4 h-4 mr-2" /> Detalles
                </Button>

                <Button
                    className="mr-2"
                    onClick={() => onSubscribe()}
                    disabled={isLoading.subscribeOne}>
                    <Plus className="w-4 h-4 mr-2" /> Suscribirse
                </Button>

                <Button
                    variant="destructive"
                    onClick={() => onRemove()}
                    disabled={isLoading.removeOne}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remover
                </Button>
            </CardFooter>
        </Card>)
}