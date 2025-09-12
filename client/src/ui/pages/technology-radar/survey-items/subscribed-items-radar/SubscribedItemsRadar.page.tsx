import type { UUID } from "crypto";
import { useState } from "react";
import { InfoIcon } from "lucide-react";

import { 
    useSurveyItems, 
    useSurveyItemsUI
} from "@/infrastructure";

import { 
    Alert,
    AlertDescription,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/components";

import { SurveyItemCard } from "./SurveyItemCard.component";

export const SubscribedRadar = () => {
    const { 
        subscribed, 
        unsubscribe, 
        remove, 
        isLoading 
    } = useSurveyItems();
    
    const { setSelectedItem } = useSurveyItemsUI();
    const [itemToRemove, setItemToRemove] = useState<UUID | null>(null);

    const handleRemoveClick = (itemId: UUID) => {
        setItemToRemove(itemId);
    };

    const confirmRemove = () => {
        if (itemToRemove) {
        remove(itemToRemove);
        setItemToRemove(null);
        }
    };

    if (subscribed.isLoading) {
        return <div>Loading subscribed items...</div>;
    }

    if (subscribed.error) {
        return (
        <Alert variant="destructive">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
            Error loading subscribed items: {subscribed.error.message}
            </AlertDescription>
        </Alert>
        );
    }

    if (!subscribed.data || subscribed.data.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                You haven't subscribed to any surveys yet
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                Subscribe to surveys from the recommendations to see them here.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                { subscribed.data.map(
                    (item) => (
                        <SurveyItemCard
                            key={item.id}
                            item={item}
                            variant="subscribed"
                            onUnsubscribe={unsubscribe}
                            onRemove={handleRemoveClick}
                            onViewDetails={setSelectedItem}
                            isLoading={isLoading.unsubscribe || isLoading.remove}
                            />
                    ))}
            </div>

            <AlertDialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all data
                    associated with this survey item from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground">
                    Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};