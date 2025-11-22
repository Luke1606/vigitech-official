import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard } from '../../../../components';
import {
    type SurveyItem,
    PathOption,
    useSurveyItems
} from '../../../../../infrastructure';
import { useCallback, useEffect, useState } from 'react';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import { Loader2, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import radarMock from '../../../../../assets/data/radarMock'

export const RecommendationsFeed: React.FC = () => {
    const {
        isLoading,
        addPendingRemoves,
        addPendingSubscribes,
    } = useSurveyItems();

    //const query = useSurveyItemsAPI()
    //const { isPending, isError, refetch } = query.recommended
    const [selectedItems, setSelectedItems] = useState<SurveyItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(9);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

    // Efecto para manejar el responsive
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            if (width < 768) { // móvil
                setItemsPerPage(3);
            } else { // tablet y desktop
                setItemsPerPage(9);
            }
        };

        // Establecer el valor inicial
        handleResize();

        // Escuchar cambios de tamaño
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Efecto para resetear a página 1 cuando cambia itemsPerPage
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

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

    // Función para generar los números de página a mostrar
    const getVisiblePages = () => {
        if (totalPages <= 5) {
            // Si hay 5 páginas o menos, mostrar todas
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const visiblePages = new Set<number>();

        // Siempre mostrar primera página
        visiblePages.add(1);

        // Siempre mostrar última página
        visiblePages.add(totalPages);

        // Mostrar página actual
        visiblePages.add(currentPage);

        // Mostrar páginas alrededor de la actual (una antes y una después)
        if (currentPage > 1) visiblePages.add(currentPage - 1);
        if (currentPage < totalPages) visiblePages.add(currentPage + 1);

        // Convertir a array y ordenar
        const pagesArray = Array.from(visiblePages).sort((a, b) => a - b);

        // Agregar puntos suspensivos donde haya gaps
        const result: (number | string)[] = [];

        for (let i = 0; i < pagesArray.length; i++) {
            if (i > 0 && pagesArray[i] - pagesArray[i - 1] > 1) {
                result.push('...');
            }
            result.push(pagesArray[i]);
        }

        return result;
    };

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

    // if (isPending)
    //     return (
    //         <div className="flex items-center justify-center mt-12 p-2">
    //             <p className="text-md text-muted-foreground flex gap-x-5">Cargando recomendaciones
    //                 <Loader2 className='animate-spin' />
    //             </p>
    //         </div>
    //     );

    // if (isError)
    //     return (
    //         <div className="flex items-center justify-center gap-x-5 mt-12">
    //             <p className="text-md text-destructive font-semibold">Error al cargar las recomendaciones. Inténtelo de nuevo</p>
    //             <Button
    //                 className='bg-blue-600 hover:bg-blue-800 transition-colors duration-300'
    //                 onClick={() => refetch()}
    //             >
    //                 <RotateCw />
    //             </Button>
    //         </div>
    //     );

    if (!recommended || recommended.length === 0) {
        return (
            <div className="text-center py-12 px-4">
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

    const visiblePages = getVisiblePages();

    return (
        <div className="space-y-4 px-4 sm:px-6 lg:px-10 mt-20 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Recomendaciones</h2>

            {/* Botones de acción - Responsive */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                {/* Select and unselect */}
                <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-800 w-full sm:w-auto sm:min-w-[12%] text-sm sm:text-base"
                    onClick={() => {
                        if (isMultipleSelection) setMultipleSelection(true);
                        if (areAllItemsSelected()) {
                            setSelectedItems([]);
                        } else {
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
                    disabled={selectedItems.length === 0}
                    className="w-full sm:w-auto text-sm sm:text-base">
                    Suscribirse ({selectedItems.length})
                </Button>

                {/* Remove */}
                <Button
                    type="button"
                    variant="destructive"
                    className='hover:bg-red-800 w-full sm:w-auto text-sm sm:text-base'
                    onClick={() => {
                        addPendingRemoves(selectedItems);
                        if (isMultipleSelection) setMultipleSelection(true);
                        removeFromSelectedItems(selectedItems);
                    }}
                    disabled={selectedItems.length === 0}>
                    Remover ({selectedItems.length})
                </Button>
            </div>

            {/* Grid de items responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 place-self-center">
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

            {/* Paginación responsive */}
            {totalPages > 1 && (
                <div className='flex justify-center'>
                    <div className="flex flex-col items-center justify-center space-y-4 mt-6 sm:mt-8 lg:relative lg:bottom-10 w-full">
                        {/* Información de página */}
                        <div className="text-sm text-muted-foreground text-center px-2">
                            Página {currentPage} de {totalPages} - {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, recommended.length)} de {recommended.length} elementos
                        </div>

                        {/* Controles de paginación */}
                        <div className="flex items-center space-x-1 sm:space-x-2 w-full justify-center">
                            {/* Botón anterior */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 text-xs sm:text-sm"
                            >
                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Anterior</span>
                            </Button>

                            {/* Números de página - Mostrar primera, actual, última y páginas adyacentes */}
                            <div className="flex items-center space-x-1">
                                {visiblePages.map((page, index) => (
                                    typeof page === 'number' ? (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(page)}
                                            className={`h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm ${currentPage === page ? 'bg-blue-600 text-white' : ''
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    ) : (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="px-1 text-xs sm:text-sm text-muted-foreground"
                                        >
                                            ...
                                        </span>
                                    )
                                ))}
                            </div>

                            {/* Botón siguiente */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline">Siguiente</span>
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};