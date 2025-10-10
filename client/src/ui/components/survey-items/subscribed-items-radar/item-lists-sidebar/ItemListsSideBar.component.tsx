import { useState } from 'react';
import { EyeIcon, EyeOff, Plus } from 'lucide-react';
import type { UserItemList } from '@/infrastructure';
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
        const [removeTarget, setRemoveTarget] = useState<{ listName: string; itemIndex: number } | null>(null);

        const availableItems: SurveyItem[] = [
            {
                id: '1',
                title: 'React',
                summary: 'Biblioteca declarativa para construir interfaces de usuario.',
                radarQuadrant: 'Frameworks',
                radarRing: 'Adoptar',
                lastAnalysists: 2025
            },
            {
                id: '2',
                title: 'TypeScript',
                summary: 'Superset de JavaScript que añade tipado estático.',
                radarQuadrant: 'Lenguajes',
                radarRing: 'Adoptar',
                lastAnalysists: 2025
            },
            {
                id: '3',
                title: 'Tailwind CSS',
                summary: 'Framework de utilidades para estilos rápidos y consistentes.',
                radarQuadrant: 'Herramientas',
                radarRing: 'Evaluar',
                lastAnalysists: 2024
            },
            {
                id: '4',
                title: 'Vite',
                summary: 'Bundler moderno para desarrollo frontend rápido.',
                radarQuadrant: 'Herramientas',
                radarRing: 'Adoptar',
                lastAnalysists: 2025
            },
            {
                id: '5',
                title: 'Zod',
                summary: 'Validador de esquemas TypeScript con inferencia de tipos.',
                radarQuadrant: 'Librerías',
                radarRing: 'Explorar',
                lastAnalysists: 2023
            }
        ];


        const [selectedItems, setSelectedItems] = useState<string[]>([]);


        const openRenameDialog = (name: string) => {
            setRenameTarget(name);
            setNewListName(name); // Prellenar con el nombre actual
        };

        const openDeleteDialog = (name: string) => {
            setDeleteTarget(name);
        };

        const openAddItemDialog = (name: string) => {
            setAddTarget(name);
            const currentList = lists.find(list => list.name === name);
            const existingIds = currentList?.items.map(item => item.id) || [];
            setSelectedItems(existingIds); // ✅ preselección
        };

        const openRemoveItemDialog = (listName: string, index: number) => {
            setRemoveTarget({ listName, itemIndex: index });
        };

        return (
            <div className='flex mt-8'>
                <Button
                    className='absolute left-60 z-40 top-16'
                    type='button'
                    onClick={toggleVisible}>
                    {visible ?
                        <>
                            <EyeOff />
                        </>
                        :
                        <>
                            <EyeIcon />
                        </>
                    }
                </Button>

                <Sidebar
                    side="left"
                    className={`my-12 transition-all duration-300 ${visible ? 'w-80' : 'w-0'}`}
                >
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="font-semibold text-xl pt-4">
                                Custom Item Lists
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {/* Botón "Crear" siempre visible, encima de las listas */}
                                    <SidebarMenuItem key="create-button">
                                        <Dialog open={open} onOpenChange={setOpen}>
                                            <DialogTrigger asChild>
                                                <SidebarMenuButton asChild className='mt-5'>
                                                    <Button>
                                                        <Plus />
                                                        Crear
                                                    </Button>
                                                </SidebarMenuButton>
                                            </DialogTrigger>

                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Crear nueva lista</DialogTitle>
                                                </DialogHeader>

                                                <Input
                                                    placeholder="Nombre de la lista"
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
                                                        }}
                                                    >
                                                        Guardar
                                                    </Button>

                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </SidebarMenuItem>


                                    {/* Mostrar mensaje si no hay listas */}
                                    {(!lists || lists.length === 0) ? (
                                        <SidebarMenuItem key="none">
                                            <p>No hay listas</p>
                                        </SidebarMenuItem>
                                    ) : (
                                        lists.map((list: UserItemList) => (
                                            <SidebarMenuItem key={list.name}>
                                                <CustomItemsList
                                                    name={list.name}
                                                    items={list.items}
                                                    onRename={(name) => openRenameDialog(name)}
                                                    onAddItem={(name) => openAddItemDialog(name)}
                                                    onDeleteList={(name) => openDeleteDialog(name)} // ✅ Aquí está el cambio
                                                    onRemoveItem={(name, index) => openRemoveItemDialog(name, index)}


                                                />


                                            </SidebarMenuItem>
                                        ))
                                    )}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    {/* Diálogo para renombrar lista */}
                    {renameTarget && (
                        <Dialog open={true} onOpenChange={() => setRenameTarget(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Renombrar lista</DialogTitle>
                                </DialogHeader>

                                <Input
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
                                        Guardar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    {deleteTarget && (
                        <Dialog open={true} onOpenChange={() => setDeleteTarget(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Eliminar lista?</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground">
                                    Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar <strong>{deleteTarget}</strong>?
                                </p>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setLists(prev => prev.filter(list => list.name !== deleteTarget));
                                            setDeleteTarget(null);
                                        }}
                                    >
                                        Eliminar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    {addTarget && (
                        <Dialog open={true} onOpenChange={() => setAddTarget(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Agregar elementos a {addTarget}</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-2">
                                    {availableItems.map(item => (
                                        <label key={item.id} className="flex items-center gap-2">
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
                                            />
                                            <span>{item.title}</span>
                                        </label>
                                    ))}

                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setAddTarget(null)}>
                                        Cancelar
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
                                                                items: updatedItems, // ✅ reemplaza con los seleccionados
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
                                        Guardar
                                    </Button>


                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    {removeTarget && (
                        <Dialog open={true} onOpenChange={() => setRemoveTarget(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Quitar elemento?</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground">
                                    ¿Estás seguro de que quieres quitar este elemento de la lista <strong>{removeTarget.listName}</strong>?
                                </p>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setLists(prev =>
                                                prev.map(list =>
                                                    list.name === removeTarget.listName
                                                        ? {
                                                            ...list,
                                                            items: list.items.filter((_, i) => i !== removeTarget.itemIndex)
                                                        }
                                                        : list
                                                )
                                            );
                                            setRemoveTarget(null);
                                        }}
                                    >
                                        Quitar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                </Sidebar>

            </div >
        )
    };