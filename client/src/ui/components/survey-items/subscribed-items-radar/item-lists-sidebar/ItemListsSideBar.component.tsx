import type { UUID } from '@/infrastructure';
import { useState, useEffect } from 'react';
import { EyeIcon, EyeOff, Plus } from 'lucide-react';
import {
    getQuadrantColor,
    getQuadrantLightColor,
    getRingColor,
    getRingLightColor,
    useUserItemLists,
    type SurveyItem,
    type UserItemList
} from '@/infrastructure';
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
    Input
} from '@/ui/components';

import { CustomItemsList } from './custom-item-list';
import { availableItems } from './available-items';

export const ItemListsSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        const {
            lists,
            addPendingCreateList,
            addPendingUpdateList,
            addPendingRemoveList,
            addPendingAppendAllItems,
            addPendingRemoveAllItems,
        } = useUserItemLists();
        const [newListName, setNewListName] = useState('');
        const [open, setOpen] = useState(false);
        const [renameTarget, setRenameTarget] = useState<string | null>(null);
        const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
        const [addTarget, setAddTarget] = useState<UserItemList | null>(null);
        const [removeElementTarget, setRemoveElementTarget] = useState<{
            listId: string;
            itemIds: UUID[]
        } | null>(null);

        const [elements, setElements] = useState<SurveyItem[]>(availableItems);

        const [selectedItems, setSelectedItems] = useState<string[]>([]);

        const openRenameDialog = (id: string, name: string) => {
            setRenameTarget(id);
            setNewListName(name);
        };

        const openDeleteDialog = (id: string) => {
            setDeleteTarget(id);
        };

        const openAddItemDialog = (id: string) => {
            const currentList: UserItemList | undefined = lists.find((list: UserItemList) => list.id === id);

            if (currentList) {
                setAddTarget(currentList);
                setElements(
                    prev =>
                        prev.filter(
                            (element: SurveyItem) =>
                                !currentList.items.includes(element)
                        )
                );
            };
        };

        const openRemoveItemDialog = (listId: string, itemIds: UUID[]) => {
            setRemoveElementTarget({ listId, itemIds });
        };

        const getAvailableItemsForTarget = (target: UserItemList): SurveyItem[] => {
            const usedIds = new Set(target.items.map(item => item.id));
            return availableItems.filter(item => !usedIds.has(item.id));
        };

        useEffect(() => {
            if (addTarget) {
                setElements(getAvailableItemsForTarget(addTarget));
                setSelectedItems([]);
            }
        }, [addTarget]);


        const listElements = !lists || lists.length === 0 ?
            (
                <SidebarMenuItem key="none">
                    <p>No lists here</p>
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
                            <Button>
                                <Plus />
                                Create
                            </Button>
                        </SidebarMenuButton>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create new list</DialogTitle>
                        </DialogHeader>

                        <Input
                            id='create-list-name'
                            placeholder="Name of the list"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                        />

                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    if (newListName.trim()) {
                                        addPendingCreateList({
                                            id: `id-local-${newListName}`,
                                            name: newListName.trim(),
                                            items: []
                                        });
                                        setNewListName('');
                                        setOpen(false);
                                    }
                                }}>
                                Save
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
                        <DialogTitle>Rename list</DialogTitle>
                    </DialogHeader>

                    <Input
                        id='rename-list-name'
                        placeholder="Nuevo nombre"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                if (newListName.trim()) {
                                    addPendingUpdateList(renameTarget, newListName.trim());
                                    setRenameTarget(null);
                                    setNewListName('');
                                }
                            }}
                        >
                            Save
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
                        <DialogTitle>Delete list?</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone. The contained elements won't be removed from the screen. ¿Are you sure you want to delete <strong>{deleteTarget}</strong>?
                    </p>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                addPendingRemoveList(deleteTarget);
                                setDeleteTarget(null);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        const addElementToListDialog = addTarget && (
            <Dialog open={true} onOpenChange={() => setAddTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add elements to {addTarget.name}</DialogTitle>
                    </DialogHeader>

                    <Input
                        id='search-elements'
                        type="text"
                        placeholder="Search by name..."
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

                    <ul className="space-y-2" role="list">
                        {elements.map((item: SurveyItem) => (
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

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                const updatedItems: SurveyItem[] = elements.filter(
                                    (item: SurveyItem) =>
                                        selectedItems.includes(item.id)
                                )

                                addPendingAppendAllItems(addTarget.id, updatedItems);
                                setSelectedItems([]);
                                setAddTarget(null);
                                setElements(getAvailableItemsForTarget(addTarget));

                            }
                            }>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        );

        const removeElementFromListDialog = removeElementTarget && (
            <Dialog open={true} onOpenChange={() => setRemoveElementTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove element?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        ¿Are you sure you want to remove this element from <strong>{
                            lists.find((list: UserItemList) => list.id === removeElementTarget.listId)?.name
                        }</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveElementTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                addPendingRemoveAllItems(
                                    removeElementTarget.listId,
                                    removeElementTarget.itemIds
                                );
                                setRemoveElementTarget(null);
                            }}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        );

        return (
            <div className='flex mt-8'>
                <Button
                    className='absolute bottom-5 left-5 z-40'
                    type='button'
                    onClick={toggleVisible}>
                    {visible ? <EyeOff /> : <EyeIcon />}
                </Button>

                <Sidebar
                    side="left"
                    className={`my-12 transition-all duration-300 ${visible ? 'w-80' : 'w-0'}`}>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="font-semibold text-xl pt-4">
                                Custom Item Lists
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu>

                                    {createButton}

                                    {listElements}

                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    {renameListDialog}

                    {deleteListDialog}

                    {addElementToListDialog}

                    {removeElementFromListDialog}
                </Sidebar>
            </div >
        )
    };