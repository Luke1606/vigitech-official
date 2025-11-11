import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard } from '../../../../components';
import {
    type SurveyItem,
    PathOption,
    useSurveyItems
} from '../../../../../infrastructure';
import { useCallback, useEffect, useState } from 'react';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import radarMock from '../../../../../assets/data/radarMock'

export const RecommendationsFeed: React.FC = () => {
    const {
        isLoading,
        addPendingRemoves,
        addPendingSubscribes,
    } = useSurveyItems();

    const query = useSurveyItemsAPI()
    const { isPending, isError, error } = query.recommended
    const [selectedItems, setSelectedItems] = useState<SurveyItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(9);

    const addToSelectedItems = (items: SurveyItem[]) => {
        setSelectedItems(prev => {
            const newItems = items.filter(item =>
                !prev.some(selected => selected.id === item.id)
            );
            return [...prev, ...newItems];
        });
    };

    const removeFromSelectedItems = (items: SurveyItem[]) => {
        setSelectedItems(prev =>
            prev.filter(selectedItem =>
                !items.some(item => item.id === selectedItem.id)
            )
        );
    };

    let recommended = radarMock;

    // Calcular elementos para la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = recommended.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(recommended.length / itemsPerPage);

    // Función para verificar si un item está seleccionado (comparando por ID)
    const isItemSelected = (item: SurveyItem) => {
        return selectedItems.some(selected => selected.id === item.id);
    };

    // Función para verificar si TODOS los items están seleccionados (no solo los de la página actual)
    const areAllItemsSelected = () => {
        return recommended.every(item => isItemSelected(item));
    };

    useEffect(() => {
        return () => setSelectedItems([])
    }, [])

    useEffect(() => {
        console.log(selectedItems)
    }, [selectedItems])

    const [
        isMultipleSelection,
        setMultipleSelection
    ] = useState<boolean>(false);

    const navigate = useNavigate();

    // Funciones de paginación
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

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
        <div className="space-y-4 px-10 mt-8">
            <h2 className="text-2xl font-bold">Recomendaciones</h2>

            <div className="flex flex-wrap items-center gap-6 mb-10">
                {/* Select and unselect - AHORA SELECCIONA TODOS */}
                <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-800 min-w-[12%]"
                    onClick={() => {
                        if (isMultipleSelection) setMultipleSelection(true);
                        if (areAllItemsSelected()) {
                            // Deseleccionar todos los items
                            setSelectedItems([]);
                        } else {
                            // Seleccionar todos los items
                            setSelectedItems([...recommended]);
                        }
                    }}>
                    {areAllItemsSelected()
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
                    }}
                    disabled={selectedItems.length === 0}>
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
                    }}
                    disabled={selectedItems.length === 0}>
                    Remover suscripciones
                </Button>
            </div>

            {/* Grid de items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-self-center">
                {currentItems.map((item: SurveyItem) => (
                    <SurveyItemCard
                        key={item.id}
                        id={item.id}
                        item={item}
                        selected={isItemSelected(item)}
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

            {/* Paginación */}
            {totalPages > 1 && (
                <div className='flex justify-center'>
                    <div className="flex flex-col items-center justify-center space-y-4 mt-8 lg:absolute lg:bottom-10">
                        {/* Información de página */}
                        <div className="text-sm text-muted-foreground">
                            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, recommended.length)} de {recommended.length} elementos
                        </div>

                        {/* Controles de paginación */}
                        <div className="flex items-center space-x-2">
                            {/* Botón anterior */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>

                            {/* Números de página */}
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => goToPage(page)}
                                        className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            {/* Botón siguiente */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};