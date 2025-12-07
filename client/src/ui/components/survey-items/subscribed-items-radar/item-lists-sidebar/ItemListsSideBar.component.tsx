import { useState, useEffect, useCallback } from 'react';
import { EyeIcon, EyeOff, Loader2, Plus, List } from 'lucide-react';
import {
    Blip,
    getQuadrantColor,
    getQuadrantLightColor,
    getRingColor,
    getRingLightColor,
    type UserItemList
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
import blips from '../../../../../assets/data/radarMock';
import { useUserItemListsAPI } from '../../../../../infrastructure/hooks/use-item-lists/api/useUserItemListsAPI.hook';
import { useUserItemLists } from '../../../../../infrastructure';

export const ItemListsSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        const {
            //     lists,
            //     createList,
            //     updateList,
            //     removeList,
            appendAllItems,
            removeAllItems,
        } = useUserItemLists();
        const query = useUserItemListsAPI();
        const { data: lists } = query.findAll

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

        const [selectedItems, setSelectedItems] = useState<string[]>([]);
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
                setElements(
                    prev =>
                        prev.filter(
                            (element: Blip) =>
                                !currentList.items.includes(element)
                        )
                );
            };
        };

        const openRemoveItemDialog = (listId: UUID, itemIds: UUID[]) => {
            setRemoveElementTarget({ listId, itemIds });
        };

        const getAvailableItemsForTarget = useCallback((target: UserItemList): Blip[] => {
            const usedIds = new Set(target.items.map(item => item.id));
            return blips.filter(item => !usedIds.has(item.id));
        }, []);

        useEffect(() => {
            if (addTarget) {
                setElements(getAvailableItemsForTarget(addTarget));
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

        const listElements = !lists || lists.length === 0 ?
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
            );

        const createButton = (
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
            <Dialog open={true} onOpenChange={() => setAddTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar elementos a <span className='text-blue-800 font-bold'>{addTarget.name}</span></DialogTitle>
                    </DialogHeader>

                    <Input
                        id='search-elements'
                        type="text"
                        placeholder="Busca por nombre..."
                        onChange={(e) => {
                            const query = e.target.value.toLowerCase();
                            const available = getAvailableItemsForTarget(addTarget);
                            setElements(
                                available.filter(item =>
                                    item.title.toLowerCase().includes(query) ||
                                    item.radarQuadrant.toLowerCase().includes(query) ||
                                    item.radarRing.toLowerCase().includes(query)
                                )
                            );
                        }}

                    />

                    <div className="max-h-64 overflow-y-auto">
                        <ul className="space-y-2" role="list">
                            {elements.map((item: Blip) => (
                                <li
                                    key={item.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <label className="flex items-center gap-4 p-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={(e) => {
                                                if (e.target.checked)
                                                    setSelectedItems(prev => [...prev, item.id]);
                                                else
                                                    setSelectedItems(prev => prev.filter(id => id !== item.id));
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
                                                    backgroundColor: getQuadrantLightColor(item.radarQuadrant),
                                                    color: getQuadrantColor(item.radarQuadrant)
                                                }}>
                                                {item.radarQuadrant}
                                            </span>

                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium"
                                                style={{
                                                    backgroundColor: getRingLightColor(item.radarRing),
                                                    color: getRingColor(item.radarRing)
                                                }}>
                                                {item.radarRing}
                                            </span>
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddTarget(null)}>
                            Cancelar
                        </Button>
                        <Button
                            name='agregarElementos'
                            onClick={() => {
                                const updatedItems: Blip[] = elements.filter(
                                    (item: Blip) =>
                                        selectedItems.includes(item.id)
                                )

                                appendAllItems(addTarget.id, updatedItems);
                                setSelectedItems([]);
                                setAddTarget(null);
                                setElements(getAvailableItemsForTarget(addTarget));

                            }
                            }>
                            Agregar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveElementTarget(null)}>
                            Cancelar
                        </Button>
                        <Button
                            name='eliminarElemento'
                            variant="destructive"
                            onClick={() => {
                                removeAllItems(
                                    removeElementTarget.listId,
                                    removeElementTarget.itemIds
                                );
                                setRemoveElementTarget(null);
                            }}>
                            Remover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
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