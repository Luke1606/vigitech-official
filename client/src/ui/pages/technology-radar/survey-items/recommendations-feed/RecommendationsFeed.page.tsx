import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard } from '../../../../components';
import {
    type SurveyItem,
    PathOption,
    useSurveyItems
} from '../../../../../infrastructure';
import { useCallback, useEffect, useState } from 'react';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import { Loader2 } from 'lucide-react';
import radarMock from '../../../../../assets/data/radarMock'

export const RecommendationsFeed: React.FC = () => {
    const {
        isLoading,
        // recommended,
        selectedItems,
        addPendingRemoves,
        addToSelectedItems,
        addPendingSubscribes,
        removeFromSelectedItems,
    } = useSurveyItems();

    const query = useSurveyItemsAPI()
    // const [selectedItems, setSelectedItems] = useState<string[]>([])
    const { /*data: recommended ,*/ isPending, isError, error } = query.recommended

    let recommended = radarMock;
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

    if (isPending)
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground flex gap-x-5">Cargando recomendaciones
                    <Loader2 className='animate-spin' />
                </p>
            </div>
        );

    if (isError)
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-destructive">Error al cargar las recomendaciones: {error.message}</p>
            </div>
        );

    if (!recommended || recommended.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground">
                    No hay recomendaciones aún. Espere un momento a que se renueven.
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Mientras tanto, puedes estar atento a los cambios o gestionar tus suscripciones.
                    <span
                        className="text-primary underline ml-1 cursor-pointer"
                        onClick={() =>
                            navigate(PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR)
                        }>
                        aquí
                    </span>.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-8 p-10">
            <h2 className="text-2xl font-bold">Recomendaciones</h2>

            <div className="flex flex-wrap items-center gap-6 mb-10">
                {/* Select and unselect*/}
                <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-800"
                    onClick={() => {
                        if (isMultipleSelection) setMultipleSelection(true);
                        addToSelectedItems(recommended);
                    }}>
                    {recommended.every((item: SurveyItem) => selectedItems.includes(item))
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos'}
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
                    Suscribirse a todos los elementos seleccionados.
                </Button>

                {/* Remove */}
                <Button
                    type="button"
                    variant="destructive"
                    className='hover:bg-red-800'
                    onClick={() => {
                        addPendingRemoves(selectedItems);
                        if (isMultipleSelection) setMultipleSelection(true);
                        removeFromSelectedItems(selectedItems);
                    }}>
                    Remover suscripciones
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-self-center">
                {recommended.map((item: SurveyItem) => (
                    <SurveyItemCard
                        key={item.id}
                        id={item.id}
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