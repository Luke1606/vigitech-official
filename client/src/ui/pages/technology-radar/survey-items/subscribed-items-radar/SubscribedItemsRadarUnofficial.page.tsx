import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoIcon } from 'lucide-react';

import { useSurveyItems, type SurveyItem, PathOption } from '../../../../../infrastructure';
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
    RadarMenu,
    ItemListsSideBar,
    ChangeLogSideBar,
    Radar,
} from '../../../../components';
    ItemListsSideBar,
    ChangeLogSideBar

type Position = { x: number; y: number };
export const SubscribedItemsRadar = () => {
    const navigate = useNavigate();

    const {
        subscribed: getSubscribed,
        selectedItems,
        addToSelectedItems,
        removeFromSelectedItems,
        addPendingUnsubscribes,
        addPendingRemoves,
    } = useSurveyItems();

    const [isMultipleSelection, setMultipleSelection] = useState<boolean>(false);
    const [hasItemsToRemove, setHasItemsToRemove] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            if (selectedItems?.length) removeFromSelectedItems(selectedItems);
        };
    }, [removeFromSelectedItems, selectedItems]);

    const handleBlipClick = useCallback(
        (entry: any, position: Position) => {
            if (isMultipleSelection) {
                const isSelected = selectedItems.includes(entry.originalItem);
                if (isSelected) removeFromSelectedItems([entry.originalItem]);
                else addToSelectedItems([entry.originalItem]);
            } else {
                return (
                    <RadarMenu
                        item={entry.originalItem}
                        isSelected={selectedItems.includes(entry.originalItem)}
                        position={position}
                        onSelect={(item: SurveyItem) => addToSelectedItems([item])}
                        onRemove={(item: SurveyItem) => addPendingRemoves([item])}
                        onUnselect={(item: SurveyItem) => removeFromSelectedItems([item])}
                        onUnsubscribe={(item: SurveyItem) => addPendingUnsubscribes([item])}
                        onViewDetails={(item: SurveyItem) =>
                            navigate(`${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/${item.id}`)
                        }
                    />
                );
            }
        },
        [
            isMultipleSelection,
            selectedItems,
            addToSelectedItems,
            removeFromSelectedItems,
            addPendingRemoves,
            addPendingUnsubscribes,
            navigate,
        ]
    );

    const handleBlipHover = useCallback((entry: any) => {
        const el = document.getElementById(`blip-${entry.id}`);
        if (el) {
            el.style.transform = 'scale(1.2)';
            el.style.transition = 'transform 0.2s ease';
        }
    }, []);

    const confirmRemove = () => {
        addPendingRemoves(selectedItems);
        if (isMultipleSelection) setMultipleSelection(true);
        removeFromSelectedItems(selectedItems);
    };

    if (getSubscribed.isLoading) return <div>Loading subscribed items...</div>;

    if (getSubscribed.error)
        return (
            <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                    Error loading subscribed items: {getSubscribed.error.message}
                </AlertDescription>
            </Alert>
        );

    if (!getSubscribed.data || getSubscribed.data.length === 0)
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                    You haven't subscribed to any surveys yet
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Subscribe to surveys from the recommendations to see them
                    <span
                        className="cursor-pointer text-primary underline"
                        onClick={() => navigate(PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED)}
                    >
                        {' here'}
                    </span>
                    .
                </p>
            </div>
        );

    const entries = (getSubscribed.data ?? []).map((item: SurveyItem) => ({
        id: String(item.id),
        name: item.title,
        quadrant: item.radarQuadrant,
        ring: item.radarRing,
        originalItem: item,
    }));

    return (
        <>
            <ItemListsSideBar />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <Button
                        type="button"
                        onClick={() => {
                            if (isMultipleSelection) setMultipleSelection(true);
                            addToSelectedItems(getSubscribed.data ?? []);
                        }}
                    >
                        {(getSubscribed.data ?? []).every((item: SurveyItem) => selectedItems.includes(item))
                            ? 'Unselect all'
                            : 'Select all'}
                    </Button>

                    <Button
                        type="button"
                        onClick={() => {
                            addPendingUnsubscribes(selectedItems);
                            if (isMultipleSelection) setMultipleSelection(true);
                            removeFromSelectedItems(selectedItems);
                        }}
                    >
                        Unsubscribe all selected
                    </Button>

                    <Button type="button" onClick={() => setHasItemsToRemove(true)}>
                        Remove all selected
                    </Button>
                </div>

                <div className="w-full h-full min-h-[500px]">
                    <Radar entries={entries} onBlipClick={handleBlipClick} onBlipHover={handleBlipHover} />
                </div>
            </div>

            <ChangeLogSideBar />

            <AlertDialog open={hasItemsToRemove} onOpenChange={() => setHasItemsToRemove(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all data associated with this
                            survey item from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={confirmRemove}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};