import { Maximize, Share2, Trash2 } from 'lucide-react';
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
} from '@/ui/components';

import type { UserItemList } from '@/infrastructure';
import styles from './CustomItemList.styles';
import { useState } from 'react';

export const CustomItemsList: React.FC<UserItemList & {
    onRename?: (name: string) => void;
    onAddItem?: (name: string) => void;
    onRemoveItem?: (name: string, index: number) => void;
    onDeleteList?: (name: string) => void;
}> = ({
    name,
    items,
    onRename,
    onAddItem,
    onRemoveItem,
    onDeleteList
}) => {
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

                    {/* Acciones generales */}
                    <DropdownMenuItem onClick={() => onRename?.(name)}>
                        ✏️ Cambiar nombre
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddItem?.(name)}>
                        ➕ Agregar elemento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteList?.(name)}>
                        🗑️ Eliminar lista
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Elementos individuales */}
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
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveItem?.(name, index)}
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
