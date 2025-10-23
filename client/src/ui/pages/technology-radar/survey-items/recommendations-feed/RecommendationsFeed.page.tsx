import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard } from '../../../../components';
import { 
    type SurveyItem, 
    PathOption, 
    useSurveyItems 
} from '../../../../../infrastructure';
import { useCallback, useEffect, useState } from 'react';

export const RecommendationsFeed: React.FC = () => {
    const { 
        isLoading,
        recommended,
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
    
    if (recommended.isLoading)
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">Loading recommendations...</p>
            </div>
        );

    if (recommended.error)
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-destructive">Error loading recommendations: {recommended.error.message}</p>
            </div>
        );

     if (!recommended.data || recommended.data.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                    There are no recommendations yet. Wait for them to renew.
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Meanwhile you can watch for changes or manage your suscriptions
                    <span
                        className="text-primary underline ml-1 cursor-pointer"
                        onClick={() =>
                            navigate(PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR)
                        }>
                        here
                    </span>.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommendations</h2>

            <div className="flex flex-wrap items-center gap-2">
                {/* Select and unselect*/}
                <Button
                    type="button"
                    className=""
                    onClick={() => {
                        if (isMultipleSelection) setMultipleSelection(true);
                        addToSelectedItems(recommended.data);
                    }}>
                    {recommended.data.every((item: SurveyItem) => selectedItems.includes(item))
                        ? 'Unselect all'
                        : 'Select all'}
                </Button>

                {/* Subscribe */}
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        addPendingSubscribes(selectedItems);
                        if (isMultipleSelection) setMultipleSelection(true);
                        removeFromSelectedItems(selectedItems);
                    }}>
                    Subscribe all selected
                </Button>

                {/* Remove */}
                <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                        addPendingRemoves(selectedItems);
                        if (isMultipleSelection) setMultipleSelection(true);
                        removeFromSelectedItems(selectedItems);
                    }}>
                    Remove all selected
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.data.map((item: SurveyItem) => (
                    <SurveyItemCard
                        key={item.id}
                        item={item}
                        selected={selectedItems.includes(item)}
                        onSelect={() => {
                            if (!isMultipleSelection) setMultipleSelection(true);
                            addToSelectedItems([item]);
                        }}
                        onUnselect={() => {
                            removeFromSelectedItems([item]);
                        }}
                        onSubscribe={() => addPendingSubscribes([item])}
                        onRemove={() => addPendingRemoves([item])}
                        onViewDetails={() =>
                            navigate(`${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/${item.id}`)
                        }
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    );
};