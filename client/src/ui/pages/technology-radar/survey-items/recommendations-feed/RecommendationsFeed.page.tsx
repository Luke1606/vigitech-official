import { useSurveyItemsUI } from '@/infrastructure';
import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard, CardVariant } from '@/ui/components';
import type { SurveyItemDto } from '@/infrastructure';
import { useCallback, useEffect, useState } from 'react';
import { PathOption } from '@/routing';

export const RecommendationsFeed: React.FC = () => {
    const { 
        recommended,
        selectedItems,
        addToSelectedItems,
        removeFromSelectedItems,
        addPendingSubscribes,
        addPendingRemoves,
        isLoading 
    } = useSurveyItemsUI();

    const unselectAll = useCallback(
        () => {
            if (selectedItems.length > 0)
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
    
    if (recommended.isLoading) {
        return <div>Loading recommendations...</div>;
    }

    if (recommended.error) {
        return <div>Error loading recommendations: {recommended.error.message}</div>;
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
                        addToSelectedItems(recommended.data);
                    }}>
                    { recommended.data.every(
                        (item: SurveyItemDto) => 
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
            
            { recommended.data.length === 0 ?
                <p>No recommendations available.</p>
                :
                recommended.data.map((item: SurveyItemDto) => (
                    <SurveyItemCard
                        key={item.id}
                        item={item}
                        variant={CardVariant.RECOMMENDED}
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
                )
            }
        </div>
    );
};