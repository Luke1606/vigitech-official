import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfoIcon } from "lucide-react";

import { useSurveyItemsUI, type SurveyItemDto, PathOption } from "@/infrastructure";
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
    Button,
    CardVariant,
    SurveyItemCard
} from "@/ui/components";

export const SubscribedItemsRadar = () => {
    const { 
        subscribed, 
        unsubscribeOne, 
        isLoading,
        selectedItems,
        addToSelectedItems,
        removeFromSelectedItems,
        addPendingUnsubscribes,
        addPendingRemoves
    } = useSurveyItemsUI();
    
    const [
        isMultipleSelection, 
        setMultipleSelection
    ] = useState<boolean>(false);
    
    const [
        hasItemsToRemove,
        setHasItemsToRemove
    ] = useState<boolean>(false);

    const unselectAll = useCallback(
        () => {
            if (selectedItems.length > 0)
                removeFromSelectedItems(selectedItems)
        }, [removeFromSelectedItems, selectedItems]
    )
    
    useEffect(() => {
        return () => unselectAll()
    }, [unselectAll])

    const navigate = useNavigate();

    const confirmRemove = () => {
        addPendingRemoves(selectedItems);
        if (isMultipleSelection)
            setMultipleSelection(true);
        removeFromSelectedItems(selectedItems);
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
                <div className="">
                    {/* Select and unselect*/}
                    <Button
                        type="button"
                        onClick={() => {
                            if (isMultipleSelection)
                                setMultipleSelection(true);
                            addToSelectedItems(subscribed.data);
                        }}>
                        { subscribed.data.every(
                            (item: SurveyItemDto) => 
                                selectedItems.includes(item)
                        )? "Unselect all" : "Select all"
                            }
                    </Button>

                    {/* Unsubscribe */}
                    <Button
                        type="button"
                        onClick={() => {
                            addPendingUnsubscribes(selectedItems);
                            if (isMultipleSelection)
                                setMultipleSelection(true);
                            removeFromSelectedItems(selectedItems);
                        }}>
                        Unsubscribe all selected
                    </Button> 

                    {/* Remove */}
                    <Button
                        type="button"
                        onClick={() => setHasItemsToRemove(true)}>
                        Remove all selected
                    </Button> 
                </div>

                { subscribed.data.map(
                    (item) => (
                        <SurveyItemCard
                            key={item.id}
                            item={item}
                            variant={CardVariant.SUBSCRIBED}
                            selected={selectedItems.includes(item)}
                            onSelect={() => {
                                if (!isMultipleSelection)
                                    setMultipleSelection(true);
                                addToSelectedItems([item]);
                            }}
                            onUnselect={() => {
                                removeFromSelectedItems([item]);
                            }}
                            onUnsubscribe={unsubscribeOne}
                            onRemove={() => setHasItemsToRemove(true)}
                            onViewDetails={
                                () => navigate(
                                    `${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/${item.id}`
                                )
                            }
                            isLoading={isLoading}
                            />
                    ))}
            </div>

            <AlertDialog
                open={hasItemsToRemove}
                onOpenChange={() => setHasItemsToRemove(false)}>
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
                        
                        <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground"
                            onClick={confirmRemove}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};