import { useState } from 'react';
import { EyeIcon, EyeOff, Plus } from 'lucide-react';
import { 
    type SurveyItem, 
    type UserItemList 
} from '@/infrastructure';
import { CustomItemsList } from './custom-item-list';
import {
    Button,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/ui/components';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/ui/components';
import { Input } from '@/ui/components';
import type { UUID } from 'crypto';
import { availableItems } from './available-items';


export const ItemListsSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        const [lists, setLists] = useState<UserItemList[]>([]);
        const [newListName, setNewListName] = useState('');
        const [open, setOpen] = useState(false);
        const [renameTarget, setRenameTarget] = useState<string | null>(null);
        const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
        const [addTarget, setAddTarget] = useState<string | null>(null);
        const [removeTarget, setRemoveTarget] = useState<{ 
            listName: string; 
            itemId: UUID 
        } | null>(null);

        const [elements, setElements] = useState<SurveyItem[]>(availableItems);

        const [selectedItems, setSelectedItems] = useState<string[]>([]);

        const openRenameDialog = (name: string) => {
            setRenameTarget(name);
            setNewListName(name);
        };

        const openDeleteDialog = (name: string) => {
            setDeleteTarget(name);
        };

        const openAddItemDialog = (name: string) => {
            setAddTarget(name);
            const currentList = lists.find(list => list.name === name);
            const existingIds = currentList?.items.map(item => item.id) || [];
            setSelectedItems(existingIds);
        };

        const openRemoveItemDialog = (listName: string, id: UUID) => {
            setRemoveTarget({ listName, itemId: id });
        };

        const listElements = !lists || lists.length === 0 ?
            (
                <SidebarMenuItem key="none">
                    <p>No lists here</p>
                </SidebarMenuItem>
            ) : (
                lists.map((list: UserItemList) => (
                    <SidebarMenuItem key={list.name}>
                        <CustomItemsList
                            name={list.name}
                            items={list.items}
                            onRename={(name) => openRenameDialog(name)}
                            onAddItem={(name) => openAddItemDialog(name)}
                            onDeleteList={(name) => openDeleteDialog(name)}
                            onRemoveItem={(name, id) => openRemoveItemDialog(name, id)}
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
                                        setLists((prev: UserItemList[]) => [
                                            ...prev,
                                            { name: newListName.trim(), items: [] },
                                        ]);
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
                                    setLists(prev =>
                                        prev.map(list =>
                                            list.name === renameTarget
                                                ? { ...list, name: newListName.trim() }
                                                : list
                                        )
                                    );
                                    setRenameTarget(null);
                                    setNewListName('');
                                }
                            }}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                                setLists(prev => prev.filter(list => list.name !== deleteTarget));
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
                        <DialogTitle>Add elements to {addTarget}</DialogTitle>
                    </DialogHeader>
                    
                    <Input 
                        id='search-elements'
                        type="text" 
                        placeholder="Search by name..."
                        onChange={
                            (e) => setElements(
                                availableItems.filter(
                                    (item: SurveyItem) => 
                                        item.title.toLowerCase().includes(e.target.value.toLowerCase())
                                )
                            )
                        }
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
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {item.radarQuadrant}
                                        </span>
                                    
                                        <span 
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                                if (addTarget) {
                                    setLists(prev =>
                                        prev.map(list => {
                                            if (list.name === addTarget) {
                                                const updatedItems = availableItems.filter(item =>
                                                    selectedItems.includes(item.id)
                                                );
                                                return {
                                                    ...list,
                                                    items: updatedItems,
                                                };
                                            }
                                            return list;
                                        })
                                    );
                                    setSelectedItems([]);
                                    setAddTarget(null);
                                }
                            }}
                        >
                            Save
                        </Button>


                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        const removeElementFromListDialog = removeTarget && (
            <Dialog open={true} onOpenChange={() => setRemoveTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove element?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        ¿Are you sure you want to remove this element from <strong>{removeTarget.listName}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setLists(prev =>
                                    prev.map(list =>
                                        list.name !== removeTarget.listName ?
                                            list
                                            : 
                                            {
                                                ...list,
                                                items: list.items.filter(
                                                    (item: SurveyItem) => 
                                                        item.id !== removeTarget.itemId
                                                )
                                            }
                                    )
                                );
                                setRemoveTarget(null);
                            }}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
        
        return (
            <div className='flex mt-8'>
                <Button
                    className='absolute bottom-5 left-5 z-40'
                    type='button'
                    onClick={toggleVisible}>
                    { visible ? <EyeOff /> : <EyeIcon /> }
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
                    
                                    { createButton }
                                    
                                    { listElements }

                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    { renameListDialog }
                    
                    { deleteListDialog }
                    
                    { addElementToListDialog }
                    
                    { removeElementFromListDialog }
                </Sidebar>
            </div >
        )
    };