import { useSurveyItems } from '@/infrastructure';
import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard } from '@/ui/components';
import { type SurveyItem, PathOption } from '@/infrastructure';
import { useCallback, useEffect, useState } from 'react';

export const RecommendationsFeed: React.FC = () => {
    const { 
        isLoading,
        recommended: getRecommended,
        selectedItems,
        addPendingRemoves,
        addToSelectedItems,
        addPendingSubscribes,
        removeFromSelectedItems,
    } = useSurveyItems();

    const unselectAll = useCallback(
        () => {
            if (selectedItems?.length > 0)
                removeFromSelectedItems(selectedItems)
        }, [removeFromSelectedItems, selectedItems]
    )

    useEffect(() => {
        return () => unselectAll()
    }, [unselectAll])

    const [
        isMultipleSelection, 
        setMultipleSelection
    ] = useState<boolean>(false);

    const navigate = useNavigate();
    
    if (getRecommended.isLoading)
        return <div>Loading recommendations...</div>;

    if (getRecommended.error)
        return <div>Error loading recommendations: {getRecommended.error.message}</div>;

     if (!getRecommended.data || getRecommended.data.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                There are no recommendations yet. Wait for them to renew.
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Meanwhile you can watch for changes or manage your suscriptions
                    <span className=""
                        onClick={() => navigate(
                            PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR
                            )
                        }>
                        {' here'}
                    </span>.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommendations</h2>
                <div className="">
                    {/* Select and unselect*/}
                    <Button
                        type="button"
                        onClick={() => {
                            if (isMultipleSelection)
                                setMultipleSelection(true);
                            addToSelectedItems(getRecommended.data);
                        }}>
                        { getRecommended.data.every(
                            (item: SurveyItem) => 
                                selectedItems.includes(item)
                        )? "Unselect all" : "Select all"
                            }
                    </Button>

                    {/* Subscribe */}
                    <Button
                        type="button"
                        onClick={() => {
                            addPendingSubscribes(selectedItems);
                            if (isMultipleSelection)
                                setMultipleSelection(true);
                            removeFromSelectedItems(selectedItems);
                        }}>
                        Subscribe all selected
                    </Button> 

                    {/* Remove */}
                    <Button
                        type="button"
                        onClick={() => {
                            addPendingRemoves(selectedItems);
                            if (isMultipleSelection)
                                setMultipleSelection(true);
                            removeFromSelectedItems(selectedItems);
                        }}>
                        Remove all selected
                    </Button> 
                </div>
            { getRecommended.data.map((item: SurveyItem) => (
                <SurveyItemCard
                    key={item.id}
                    item={item}
                    selected={selectedItems.includes(item)}
                    onSelect={() => {
                        if (!isMultipleSelection)
                            setMultipleSelection(true);
                        addToSelectedItems([item]);
                    }}
                    onUnselect={() => {
                        removeFromSelectedItems([item]);
                    }}
                    onSubscribe={() => addPendingSubscribes([item])}
                    onRemove={() => addPendingRemoves([item])}
                    onViewDetails={
                        () => navigate(
                            `${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/${item.id}`
                        )
                    }
                    isLoading={isLoading}
                    />
                )
            )}
        </div>
    );
};