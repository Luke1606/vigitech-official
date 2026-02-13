import { useNavigate } from 'react-router-dom';
import { Button, SurveyItemCard } from '../../../../components';
import {
    type SurveyItem,
    PathOption,
} from '../../../../../infrastructure';
import { useEffect, useState } from 'react';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import { Loader2, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export const RecommendationsFeed: React.FC = () => {
    const navigate = useNavigate();

    const [selectedItems, setSelectedItems] = useState<SurveyItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(9);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [isMultipleSelection, setIsMultipleSelection] = useState<boolean>(false);

    // ----------------------------------------------------------------------
    // HOOK DE API CON CALLBACKS DE LIMPIEZA INYECTADOS (¡SOLO AQUÍ!)
    // ----------------------------------------------------------------------
    const query = useSurveyItemsAPI({
        onSubscribeBatchSuccess: (subscribedIds) => {
            // Limpia SOLO los items que acaban de ser suscritos
            setSelectedItems((prev) =>
                prev.filter((item) => !subscribedIds.includes(item.id))
            );
            // Opcional: salir del modo selección múltiple
            setIsMultipleSelection(false);
        },
        onRemoveBatchSuccess: (removedIds) => {
            // Limpia SOLO los items que acaban de ser eliminados
            setSelectedItems((prev) =>
                prev.filter((item) => !removedIds.includes(item.id))
            );
            setIsMultipleSelection(false);
        },
    });

    // Obtener recomendaciones desde la query
    const {
        data: recommendedData,
        isPending: isRecommendedLoading,
        isError: isRecommendedError,
        refetch: refetchRecommended,
    } = query.recommended;

    const recommended = recommendedData || [];

    // ----------------------------------------------------------------------
    // Efectos (responsive, reset de página, limpieza al desmontar)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            if (width < 768) {
                setItemsPerPage(3);
            } else {
                setItemsPerPage(9);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    useEffect(() => {
        return () => setSelectedItems([]);
    }, []);

    // ----------------------------------------------------------------------
    // Funciones auxiliares (selección, paginación)
    // ----------------------------------------------------------------------
    const addToSelectedItems = (items: SurveyItem[]) => {
        setSelectedItems((prev) => {
            const newItems = items.filter(
                (item) => !prev.some((selected) => selected.id === item.id)
            );
            return [...prev, ...newItems];
        });
    };

    const removeFromSelectedItems = (items: SurveyItem[]) => {
        setSelectedItems((prev) =>
            prev.filter(
                (selectedItem) => !items.some((item) => item.id === selectedItem.id)
            )
        );
    };

    const isItemSelected = (item: SurveyItem) =>
        selectedItems.some((selected) => selected.id === item.id);

    const areAllItemsSelected = () =>
        recommended.every((item) => isItemSelected(item));

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = recommended.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(recommended.length / itemsPerPage);

    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const visiblePages = new Set<number>();
        visiblePages.add(1);
        visiblePages.add(totalPages);
        visiblePages.add(currentPage);
        if (currentPage > 1) visiblePages.add(currentPage - 1);
        if (currentPage < totalPages) visiblePages.add(currentPage + 1);
        const pagesArray = Array.from(visiblePages).sort((a, b) => a - b);
        const result: (number | string)[] = [];
        for (let i = 0; i < pagesArray.length; i++) {
            if (i > 0 && pagesArray[i] - pagesArray[i - 1] > 1) {
                result.push('...');
            }
            result.push(pagesArray[i]);
        }
        return result;
    };

    const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    const handleUpdateRecommendations = () => {
        query.runGlobalRecommendations();
    };

    const handleRetry = () => {
        query.runGlobalRecommendations();
    };

    // ----------------------------------------------------------------------
    // Render condicional (cargando, vacío, error)
    // ----------------------------------------------------------------------
    if (isRecommendedLoading && !recommended.length) {
        return (
            <div className="flex items-center justify-center mt-12 p-2">
                <p className="text-md text-muted-foreground flex gap-x-5">
                    Cargando recomendaciones
                    <Loader2 className="animate-spin" />
                </p>
            </div>
        );
    }

    if (!isRecommendedLoading && recommended.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <h3 className="text-lg font-medium text-muted-foreground">
                    No hay recomendaciones disponibles.
                </h3>
                <div className="flex flex-col items-center justify-center gap-4 mt-6">
                    <div className="flex items-center gap-x-5">
                        <p className="text-md text-destructive font-semibold">
                            {isRecommendedError
                                ? 'Error al cargar las recomendaciones'
                                : 'No hay recomendaciones disponibles'}
                        </p>
                        <Button
                            className="bg-blue-600 hover:bg-blue-800 transition-colors duration-300 flex items-center gap-2"
                            onClick={handleRetry}
                            disabled={query.isLoading.runGlobalRecommendations}
                        >
                            {query.isLoading.runGlobalRecommendations ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <RotateCw className="w-4 h-4" />
                                    Actualizar recomendaciones
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Mientras tanto, puedes estar atento a los cambios o gestionar tus
                        suscripciones.
                        <span
                            className="text-primary underline ml-1 cursor-pointer"
                            onClick={() =>
                                navigate(
                                    PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR
                                )
                            }
                        >
                            aquí
                        </span>
                        .
                    </p>
                </div>
            </div>
        );
    }

    const visiblePages = getVisiblePages();

    // ----------------------------------------------------------------------
    // Render principal
    // ----------------------------------------------------------------------
    return (
        <div className="space-y-4 px-4 sm:px-6 lg:px-10 mt-20 sm:mt-8">
            {/* Alerta de error de carga */}
            {isRecommendedError && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 gap-3">
                    <div className="flex-1">
                        <p className="text-sm text-yellow-800">
                            No se pudieron cargar las recomendaciones de la API.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 flex items-center gap-2"
                            onClick={() => refetchRecommended()}
                            disabled={isRecommendedLoading}
                        >
                            {isRecommendedLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Reintentando...
                                </>
                            ) : (
                                <>
                                    <RotateCw className="w-4 h-4" />
                                    Reintentar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Cabecera y botón de actualizar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Recomendaciones</h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateRecommendations}
                    disabled={query.isLoading.runGlobalRecommendations || isRecommendedLoading}
                    className="flex items-center gap-2"
                >
                    {query.isLoading.runGlobalRecommendations ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <RotateCw className="w-4 h-4" />
                            Actualizar recomendaciones
                        </>
                    )}
                </Button>
            </div>

            {/* Botones de acción - SIN onSuccess inline */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                {/* Seleccionar / Deseleccionar todos */}
                <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-800 w-full sm:w-auto sm:min-w-[12%] text-sm sm:text-base"
                    onClick={() => {
                        if (!isMultipleSelection) setIsMultipleSelection(true);
                        if (areAllItemsSelected()) {
                            setSelectedItems([]);
                        } else {
                            setSelectedItems([...recommended]);
                        }
                    }}
                >
                    {areAllItemsSelected()
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos'}
                </Button>

                {/* Suscribirse batch - LLAMADA DIRECTA, SIN onSuccess */}
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        const selectedIds = selectedItems.map((item) => item.id);
                        query.subscribeBatch(selectedIds); // 🟢 La limpieza se maneja en el hook
                    }}
                    disabled={selectedItems.length === 0 || query.isLoading.subscribeBatch}
                    className="w-full sm:w-auto text-sm sm:text-base"
                >
                    {query.isLoading.subscribeBatch ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Suscribiendo...
                        </>
                    ) : (
                        `Suscribirse (${selectedItems.length})`
                    )}
                </Button>

                {/* Remover batch - LLAMADA DIRECTA, SIN onSuccess */}
                <Button
                    type="button"
                    variant="destructive"
                    className="hover:bg-red-800 w-full sm:w-auto text-sm sm:text-base"
                    onClick={() => {
                        const selectedIds = selectedItems.map((item) => item.id);
                        query.removeBatch(selectedIds); // 🟢 La limpieza se maneja en el hook
                    }}
                    disabled={selectedItems.length === 0 || query.isLoading.removeBatch}
                >
                    {query.isLoading.removeBatch ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Removiendo...
                        </>
                    ) : (
                        `Remover (${selectedItems.length})`
                    )}
                </Button>
            </div>

            {/* Grid de items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 place-self-center">
                {currentItems.map((item: SurveyItem) => (
                    <SurveyItemCard
                        key={item.id}
                        id={item.id}
                        item={item}
                        selected={isItemSelected(item)}
                        onSelect={() => {
                            if (!isMultipleSelection) setIsMultipleSelection(true);
                            addToSelectedItems([item]);
                        }}
                        onUnselect={() => {
                            removeFromSelectedItems([item]);
                        }}
                        onSubscribeOne={() => {
                            query.subscribeOne(item.id, {
                                onSuccess: () => removeFromSelectedItems([item])
                            });
                        }}
                        onRemoveOne={() => {
                            query.removeOne(item.id, {
                                onSuccess: () => removeFromSelectedItems([item])
                            });
                        }}
                        onViewDetails={() =>
                            navigate(`${PathOption.TECHNOLOGY_RADAR_ITEM_DETAILS}/${item.id}`)
                        }
                        isLoading={{
                            subscribeOne: query.isLoading.subscribeOne,
                            removeOne: query.isLoading.removeOne,
                        }}
                    />
                ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="flex flex-col items-center justify-center space-y-4 mt-6 sm:mt-8 lg:relative lg:bottom-10 w-full">
                        <div className="text-sm text-muted-foreground text-center px-2">
                            Página {currentPage} de {totalPages} - {indexOfFirstItem + 1}-
                            {Math.min(indexOfLastItem, recommended.length)} de{' '}
                            {recommended.length} elementos
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 w-full justify-center">
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
                            <div className="flex items-center space-x-1">
                                {visiblePages.map((page, index) =>
                                    typeof page === 'number' ? (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => goToPage(page)}
                                            className={`h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : ''
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
                                )}
                            </div>
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