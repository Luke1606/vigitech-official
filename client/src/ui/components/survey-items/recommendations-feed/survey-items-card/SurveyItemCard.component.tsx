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
    id: UUID;
    item: SurveyItem
    selected: boolean
    onSelect: CallableFunction
    onUnselect: CallableFunction
    onSubscribeOne: CallableFunction  // Cambiado de onSubscribe
    onRemoveOne: CallableFunction     // Cambiado de onRemove
    onViewDetails: CallableFunction
    isLoading: {
        subscribeOne: boolean
        removeOne: boolean
    }
}> = ({
    id,
    item,
    selected,
    onSelect,
    onUnselect,
    onSubscribeOne,  // Cambiado
    onRemoveOne,     // Cambiado
    onViewDetails,
    isLoading
}) => {

        return (
            <Card
                key={id}
                className={`border-4 ${selected ? "border-blue-400" : "border-background"} w-fit`}
                onClick={() => {
                    if (selected) onUnselect();
                    else onSelect();
                }}>
                <CardHeader>
                    <CardTitle className="font-bold">{item.title}</CardTitle>
                    <CardDescription>{item.summary}</CardDescription>
                </CardHeader>

                <CardFooter className="flex gap-x-5">
                    <Button
                        className="bg-purple-800 hover:bg-purple-950"
                        onClick={() => onViewDetails()}
                        disabled={isLoading.subscribeOne}>
                        <View className="w-4 h-4" /> Detalles
                    </Button>

                    <Button
                        className="bg-blue-600 hover:bg-blue-800"
                        onClick={() => onSubscribeOne(id)}  // Pasa el id
                        disabled={isLoading.subscribeOne}>
                        <Plus className="w-4 h-4" /> Suscribirse
                    </Button>

                    <Button
                        variant="destructive"
                        className="hover:bg-red-800"
                        onClick={() => onRemoveOne(id)}  // Pasa el id
                        disabled={isLoading.removeOne}>
                        <Trash2 className="w-4 h-4" /> Remover
                    </Button>
                </CardFooter>
            </Card>)
    }