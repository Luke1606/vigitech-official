import { useState, useEffect, useCallback, useMemo } from 'react';
import { EyeIcon, EyeOff, Loader2, Plus, List } from 'lucide-react';
import {
    Blip,
    getQuadrantColor,
    getQuadrantLightColor,
    getRingColor,
    getRingLightColor,
    type UserItemList,
    RadarQuadrant,
    RadarRing
} from '../../../../../infrastructure';
import {
    Button,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Input,
} from '../../..';
import { SyncButton } from '../../../sync-button';
import { CustomItemsList } from './custom-item-list';
import { UUID } from 'crypto';
import { useUserItemListsAPI } from '../../../../../infrastructure/hooks/use-item-lists/api/useUserItemListsAPI.hook';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';

// ============ FUNCIONES DE NORMALIZACIÓN (copiadas desde Radar) ============
const mapApiQuadrantToEnum = (apiValue: string): RadarQuadrant => {
    switch (apiValue) {
        case 'LANGUAGES_AND_FRAMEWORKS':
            return RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;
        case 'BUSSINESS_INTEL':
            return RadarQuadrant.BUSSINESS_INTEL;
        case 'SCIENTIFIC_STAGE':
            return RadarQuadrant.SCIENTIFIC_STAGE;
        case 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES':
            return RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES;
        default:
            console.warn(`Unknown quadrant from API: ${apiValue}`);
            return RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;
    }
};

const mapApiRingToEnum = (apiValue: string): RadarRing => {
    switch (apiValue) {
        case 'ADOPT':
            return RadarRing.ADOPT;
        case 'TEST':
            return RadarRing.TEST;
        case 'SUSTAIN':
            return RadarRing.SUSTAIN;
        case 'HOLD':
            return RadarRing.HOLD;
        default:
            console.warn(`Unknown ring from API: ${apiValue}`);
            return RadarRing.SUSTAIN;
    }
};

const transformApiData = (apiData: any[]): Blip[] => {
    if (!apiData || !Array.isArray(apiData)) {
        return [];
    }
    return apiData.map(item => ({
        ...item,
        itemField: mapApiQuadrantToEnum(item.itemField),
        latestClassification: {
            ...item.latestClassification,
            classification: mapApiRingToEnum(item.latestClassification.classification)
        }
    }));
};
// ========================================================================

export const ItemListsSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        // ----- OBTENCIÓN DE DATOS DESDE LA API (sin Redux) -----
        const surveyItemsAPI = useSurveyItemsAPI();
        const [normalizedBlips, setNormalizedBlips] = useState<Blip[]>([]);

        useEffect(() => {
            const { data } = surveyItemsAPI.subscribed;
            if (data) {
                console.log("[ItemListsSideBar] Datos crudos de la API:", data);
                const transformed = transformApiData(data);
                console.log("[ItemListsSideBar] Datos transformados:", transformed);
                setNormalizedBlips(transformed);
            } else {
                setNormalizedBlips([]);
            }
        }, [surveyItemsAPI.subscribed.data]);

        const blips = normalizedBlips; // Alias para mantener el resto del código

        // ----- LÓGICA EXISTENTE SIN CAMBIOS -----
        const query = useUserItemListsAPI();
        const { data: lists } = query.findAll;
        const [newListName, setNewListName] = useState('');
        const [open, setOpen] = useState(false);
        const [renameTarget, setRenameTarget] = useState<UUID | null>(null);
        const [deleteTarget, setDeleteTarget] = useState<UUID | null>(null);
        const [addTarget, setAddTarget] = useState<UserItemList | null>(null);
        const [removeElementTarget, setRemoveElementTarget] = useState<{
            listId: UUID;
            itemIds: UUID[]
        } | null>(null);

        const [elements, setElements] = useState<Blip[]>(blips);
        const [selectedItems, setSelectedItems] = useState<UUID[]>([]);
        const [isMobile, setIsMobile] = useState(false);
        const [mobileDialogOpen, setMobileDialogOpen] = useState(false);

        // Detectar si estamos en móvil
        useEffect(() => {
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 768);
            };

            checkMobile();
            window.addEventListener('resize', checkMobile);

            return () => {
                window.removeEventListener('resize', checkMobile);
            };
        }, []);

        const openRenameDialog = (id: UUID, name: string) => {
            setRenameTarget(id);
            setNewListName(name);
        };

        const openDeleteDialog = (id: UUID) => {
            setDeleteTarget(id);
        };

        const openAddItemDialog = (id: string) => {
            const currentList: UserItemList | undefined = lists?.find((list: UserItemList) => list.id === id);

            if (currentList) {
                setAddTarget(currentList);
                // Filtrar elementos disponibles inmediatamente
                const usedIds = new Set(currentList.items.map(item => item.id));
                const availableItems = blips.filter(item => !usedIds.has(item.id));
                setElements(availableItems);
                setSelectedItems([]); // Resetear selección
            };
        };

        const openRemoveItemDialog = (listId: UUID, itemIds: UUID[]) => {
            console.log("Abriendo diálogo de eliminación:", { listId, itemIds });
            setRemoveElementTarget({ listId, itemIds });
        };

        // Función para obtener elementos disponibles para una lista
        const getAvailableItemsForTarget = useCallback((target: UserItemList): Blip[] => {
            const usedIds = new Set(target.items.map(item => item.id));
            return blips.filter(item => !usedIds.has(item.id));
        }, [blips]);

        // Función para manejar búsqueda
        const handleSearchChange = useCallback((searchQuery: string, target: UserItemList) => {
            const availableItems = getAvailableItemsForTarget(target);
            const filteredItems = availableItems.filter(item =>
                item.title.toLowerCase().includes(searchQuery) ||
                (typeof item.itemField === 'string' && item.itemField.toLowerCase().includes(searchQuery)) ||
                (typeof item.latestClassification?.classification === 'string' &&
                    item.latestClassification?.classification?.toLowerCase().includes(searchQuery))
            );
            setElements(filteredItems);
        }, [getAvailableItemsForTarget]);

        // Actualizar elementos cuando addTarget cambia
        useEffect(() => {
            if (addTarget) {
                const availableItems = getAvailableItemsForTarget(addTarget);
                setElements(availableItems);
                setSelectedItems([]);
            }
        }, [addTarget, getAvailableItemsForTarget]);

        const handleMobileToggle = () => {
            if (isMobile) {
                setMobileDialogOpen(!mobileDialogOpen);
            } else {
                toggleVisible();
            }
        };

        // Contenido reutilizable para ambos casos (sidebar y dialog)
        const sidebarContent = (
            <>
                <SidebarGroup>
                    <SidebarGroupLabel className="font-semibold text-xl pt-4 flex justify-between">
                        Listas personalizadas
                        <SyncButton />
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Create Button */}
                            <SidebarMenuItem key="create-button">
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <SidebarMenuButton asChild className='mt-5'>
                                            <Button disabled={query.isPending.createList}>
                                                {query.isPending.createList ?
                                                    <Loader2 className='animate-spin' />
                                                    :
                                                    <>
                                                        <Plus />
                                                        Crear
                                                    </>
                                                }
                                            </Button>
                                        </SidebarMenuButton>
                                    </DialogTrigger>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Crear lista</DialogTitle>
                                        </DialogHeader>

                                        <Input
                                            id='create-list-name'
                                            placeholder="Nombre de la lista"
                                            value={newListName}
                                            onChange={(e) => setNewListName(e.target.value)}
                                        />

                                        <DialogFooter>
                                            <Button
                                                name='crearLista'
                                                onClick={() => {
                                                    if (newListName.trim()) {
                                                        query.createList(
                                                            newListName.trim(),
                                                        );

                                                        setNewListName('');
                                                        setOpen(false);
                                                    }
                                                }}>
                                                Crear
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </SidebarMenuItem>

                            {/* List Elements */}
                            {!lists || lists.length === 0 ?
                                (
                                    <SidebarMenuItem key="none">
                                        <p>No hay listas</p>
                                    </SidebarMenuItem>
                                ) : (
                                    lists.map((list: UserItemList) => (
                                        <SidebarMenuItem key={list.id}>
                                            <CustomItemsList
                                                list={list}
                                                onRename={(id, listNewName) => openRenameDialog(id, listNewName)}
                                                onAddItem={(id) => openAddItemDialog(id)}
                                                onDeleteList={(id) => openDeleteDialog(id)}
                                                onRemoveItem={(listId, itemIds) => openRemoveItemDialog(listId, itemIds)}
                                            />
                                        </SidebarMenuItem>
                                    ))
                                )
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </>
        );

        const renameListDialog = renameTarget && (
            <Dialog open={true} onOpenChange={() => setRenameTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renombrar lista</DialogTitle>
                    </DialogHeader>

                    <Input
                        id='rename-list-name'
                        placeholder="Nuevo nombre"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />

                    <DialogFooter>
                        <Button
                            name='renombrarLista'
                            onClick={() => {
                                if (newListName.trim()) {
                                    query.updateList({ listId: renameTarget, listNewName: newListName.trim() });
                                    setRenameTarget(null);
                                    setNewListName('');
                                }
                            }}
                        >
                            Renombrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        );

        const deleteListDialog = deleteTarget && (
            <Dialog
                open={true}
                onOpenChange={
                    () => setDeleteTarget(null)
                }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar lista?</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        ¿Esta acción no se puede deshacer. Los elementos contenidos no se eliminarán de la pantalla. ¿Estás seguro de que deseas eliminar <strong>{deleteTarget}</strong>?
                    </p>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}>
                            Cancelar
                        </Button>
                        <Button
                            name='eliminarLista'
                            variant="destructive"
                            onClick={() => {
                                query.deleteList(deleteTarget);
                                setDeleteTarget(null);
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        const addElementToListDialog = addTarget && (
            <Dialog open={true} onOpenChange={() => {
                setAddTarget(null);
                setSelectedItems([]);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar elementos a <span className='text-blue-800 font-bold'>{addTarget.name}</span></DialogTitle>
                    </DialogHeader>

                    <Input
                        id='search-elements'
                        type="text"
                        placeholder="Busca por nombre..."
                        onChange={(e) => {
                            const searchQuery = e.target.value.toLowerCase();
                            handleSearchChange(searchQuery, addTarget);
                        }}
                    />

                    <div className="max-h-64 overflow-y-auto">
                        <ul className="space-y-2" role="list">
                            {elements.length === 0 ? (
                                <li className="text-center p-4 text-gray-500">
                                    No hay elementos disponibles para agregar
                                </li>
                            ) : (
                                elements.map((item: Blip) => (
                                    <li
                                        key={item.id}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <label className="flex items-center gap-4 p-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedItems(prev => [...prev, item.id]);
                                                    } else {
                                                        setSelectedItems(prev => prev.filter(id => id !== item.id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                aria-labelledby={`item-title-${item.id}`}
                                            />

                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    id={`item-title-${item.id}`}
                                                    className="text-gray-900 font-medium truncate">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium"
                                                    style={{
                                                        backgroundColor: getQuadrantLightColor(item.itemField),
                                                        color: getQuadrantColor(item.itemField)
                                                    }}>
                                                    {item.itemField}
                                                </span>

                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium"
                                                    style={{
                                                        backgroundColor: getRingLightColor(item.latestClassification?.classification),
                                                        color: getRingColor(item.latestClassification?.classification)
                                                    }}>
                                                    {item.latestClassification?.classification}
                                                </span>
                                            </div>
                                        </label>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setAddTarget(null);
                            setSelectedItems([]);
                        }}>
                            Cancelar
                        </Button>
                        <Button
                            name='agregarElementos'
                            disabled={selectedItems.length === 0 || query.isPending.appendAllItem}
                            onClick={() => {
                                if (selectedItems.length > 0) {
                                    console.log("Agregando items a lista:", {
                                        listId: addTarget.id,
                                        itemIds: selectedItems
                                    });

                                    query.appendAllItem({
                                        listId: addTarget.id,
                                        itemIds: selectedItems
                                    });

                                    setSelectedItems([]);
                                    setAddTarget(null);
                                }
                            }}>
                            {query.isPending.appendAllItem ? 'Agregando...' : `Agregar (${selectedItems.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        const removeElementFromListDialog = removeElementTarget && (
            <Dialog open={true} onOpenChange={() => setRemoveElementTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remover elementos</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        ¿Está seguro de que quiere remover <strong>{
                            lists?.find((list: UserItemList) => list.id === removeElementTarget.listId)?.name
                        }</strong> de la lista?
                    </p>
                    <div className="max-h-40 overflow-y-auto">
                        <p className="text-sm font-semibold mb-2">Elementos a remover ({removeElementTarget.itemIds.length}):</p>
                        <ul className="text-sm space-y-1">
                            {removeElementTarget.itemIds.map(itemId => {
                                const item = blips.find(blip => blip.id === itemId);
                                return (
                                    <li key={itemId} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        <span>{item?.title || `ID: ${itemId}`}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveElementTarget(null)}>
                            Cancelar
                        </Button>
                        <Button
                            name='eliminarElemento'
                            variant="destructive"
                            disabled={query.isPending.removeAllItem}
                            onClick={async () => {
                                console.log("Iniciando eliminación de elementos:", removeElementTarget);

                                try {
                                    await query.removeAllItem({
                                        listId: removeElementTarget.listId,
                                        itemIds: removeElementTarget.itemIds
                                    });
                                    console.log("Eliminación completada exitosamente");
                                } catch (error) {
                                    console.error("Error en eliminación:", error);
                                } finally {
                                    setRemoveElementTarget(null);
                                }
                            }}>
                            {query.isPending.removeAllItem ? 'Removiendo...' : `Remover (${removeElementTarget.itemIds.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        return (
            <div className='flex mt-8 lg:mb-0 mb-24'>
                {/* Botón para móvil - posición fixed en la parte superior */}
                {isMobile && (
                    <Button
                        className='fixed top-20 left-4 z-50 flex items-center gap-2 shadow-lg'
                        type='button'
                        onClick={handleMobileToggle}
                        size="sm"
                    >
                        <List className="h-4 w-4" />
                        Listas
                    </Button>
                )}

                {/* Botón para desktop - posición original */}
                {!isMobile && (
                    <Button
                        className='absolute bottom-5 left-5 z-40'
                        type='button'
                        onClick={toggleVisible}>
                        {visible ? <EyeOff /> : <EyeIcon />}
                    </Button>
                )}

                {/* Sidebar para desktop */}
                {!isMobile && (
                    <Sidebar
                        side="left"
                        className={`my-12 transition-all duration-300 ${visible ? 'w-80' : 'w-0'}`}>
                        <SidebarContent>
                            {sidebarContent}
                        </SidebarContent>

                        {renameListDialog}
                        {deleteListDialog}
                        {addElementToListDialog}
                        {removeElementFromListDialog}
                    </Sidebar>
                )}

                {/* Dialog para móvil */}
                {isMobile && (
                    <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
                        <DialogContent className="max-w-[90vw] h-[80vh] flex flex-col">
                            <div className="flex-1 overflow-y-auto mt-4">
                                <SidebarContent>
                                    {sidebarContent}
                                </SidebarContent>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {renameListDialog}
                {deleteListDialog}
                {addElementToListDialog}
                {removeElementFromListDialog}
            </div>
        )
    };