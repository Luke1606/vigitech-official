import type { UUID } from 'crypto';
import { Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    Button
} from '../../../..';
import type { UserItemList } from '../../../../../../infrastructure';
import styles from './CustomItemList.styles';

export const CustomItemsList: React.FC<{
    list: UserItemList
    onRename?: (id: string, listNewName: string) => void;
    onAddItem?: (name: string) => void;
    onRemoveItem?: (listid: string, itemIds: UUID[]) => void;
    onDeleteList?: (id: UUID) => void;
}> = ({
    list,
    onRename,
    onAddItem,
    onRemoveItem,
    onDeleteList
}) => {
        const { id, name, items } = list;
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className={styles.expandButton}>
                        {name}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-72 space-y-2">
                    <DropdownMenuLabel className="text-lg font-semibold">
                        {name}
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => onRename?.(id, name)}>
                        ✏️ Cambiar nombre
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onAddItem?.(id)}>
                        ➕ Agregar elemento
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onDeleteList?.(id)}>
                        🗑️ Eliminar lista
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-2">Sin elementos</p>
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center px-2">
                                <DropdownMenuItem className="text-md">
                                    {item.title}
                                </DropdownMenuItem>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            name='cesto'
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveItem?.(id, [item.id])}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Quitar elemento</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };
