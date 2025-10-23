import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfoIcon } from "lucide-react";

import radar_visualization from '@/assets/radar/radar_visualization';
import { useSurveyItems, type SurveyItem, PathOption, type RadarEntry, mapSurveyItemToRadarEntry } from "@/infrastructure";
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
} from "@/ui/components";

type Position = {
    x: number;
    y: number;
};

export const SubscribedItemsRadar = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    const { 
        subscribed: getSubscribed, 
        selectedItems,
        addToSelectedItems,
        removeFromSelectedItems,
        addPendingUnsubscribes,
        addPendingRemoves
    } = useSurveyItems();
    
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
            if (selectedItems?.length > 0)
                removeFromSelectedItems(selectedItems)
        }, [removeFromSelectedItems, selectedItems]
    )
    
    useEffect(() => {
        return () => unselectAll()
    }, [unselectAll])

    const handleBlipClick = useCallback((entry: RadarEntry, position: Position) => {
        if (isMultipleSelection) {
            const isSelected = selectedItems.includes(entry.originalItem);

            if (isSelected) {
                removeFromSelectedItems([entry.originalItem]);
            } else {
                addToSelectedItems([entry.originalItem]);
            }
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
                    onViewDetails={
                        (item: SurveyItem) => 
                            navigate(
                                `${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/${item.id}`
                            )
                        }
                    />
            )
        }
    }, [
        navigate, 
        selectedItems, 
        addPendingRemoves, 
        addToSelectedItems, 
        isMultipleSelection, 
        addPendingUnsubscribes, 
        removeFromSelectedItems,
    ]);

    const handleBlipHover = useCallback((entry: RadarEntry) => {
        const blip = document.getElementById(`blip-${entry.id}`);
        if (blip) {
            blip.style.transform = 'scale(1.2)';
            blip.style.transition = 'transform 0.2s ease';
        }
    }, []);

    const initializeRadar = useCallback(() => {
        if (
            !svgRef.current || 
            !containerRef.current || 
            !getSubscribed?.data || 
            getSubscribed?.data.length === 0
        ) return;

        const radarEntries = getSubscribed?.data.map(
            (item: SurveyItem) => mapSurveyItemToRadarEntry(item)
        );

        const config = {
            svg_id: "modern-radar",
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,

            colors: {
                background: 'transparent',
                grid: "#94a3b8",
                inactive: "#cbd5e1"
            },

            quadrants: [
                { name: "Business Intelligence" },
                { name: "Scientific Stage" },
                { name: "Platform and Supported Tool" },
                { name: "Languages and Framework" },
            ],

            rings: [
                { name: "ADOPT", color: "#5ba300", description: "Tecnologías listas para producción" },
                { name: "TEST", color: "#009eb0", description: "Evaluar para adopción futura" },
                { name: "SUSTAIN", color: "#c7ba00", description: "Mantener, considerar reemplazo" },
                { name: "HOLD", color: "#e09b96", description: "Evitar nuevas implementaciones" }
            ],

            scale: 1,
            print_layout: true,
            links_in_new_tabs: false,
            entries: radarEntries,

            onBlipClick: (entry: RadarEntry, position: Position) => handleBlipClick(entry, position),
            onBlipHover: (entry: RadarEntry) => handleBlipHover(entry)
        };

        svgRef.current.innerHTML = '';
        
        radar_visualization(config);
    }, [getSubscribed.data, handleBlipClick, handleBlipHover]);

    useEffect(() => {
        initializeRadar();
        
        const resizeObserver = new ResizeObserver(initializeRadar);

        if (containerRef.current)
            resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [initializeRadar]);

    const confirmRemove = () => {
        addPendingRemoves(selectedItems);
        if (isMultipleSelection)
            setMultipleSelection(true);
        removeFromSelectedItems(selectedItems);
    };

    if (getSubscribed.isLoading) {
        return <div>Loading subscribed items...</div>;
    }

    if (getSubscribed.error) {
        return (
            <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />

                <AlertDescription>
                    Error loading subscribed items: {getSubscribed.error.message}
                </AlertDescription>
            </Alert>
        );
    }

    if (!getSubscribed.data || getSubscribed.data.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                    You haven't subscribed to any surveys yet
                </h3>
        
                <p className="text-sm text-muted-foreground mt-2">
                    Subscribe to surveys from the recommendations to see them
        
                    <span className=""
                        onClick={() => navigate(
                            PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED
                            )
                        }>
                        {' here'}
                    </span>.
                </p>
            </div>
        );
    }

    return (
        <>
            <SideBar />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="">
                    {/* Select and unselect*/}
                    <Button
                        type="button"
                        onClick={() => {
                            if (isMultipleSelection)
                                setMultipleSelection(true);
                            addToSelectedItems(getSubscribed.data);
                        }}>
                        { getSubscribed.data.every(
                            (item: SurveyItem) => 
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

                <div ref={containerRef} className='w-full h-full min-h-[500px]'>
                    <svg 
                        ref={svgRef} 
                        id="modern-radar"
                        className="w-full h-full"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </div>
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