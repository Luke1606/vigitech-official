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

export const CustomItemsList: React.FC<UserItemList> = ({
    name, 
    items
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    className={styles.expandButton}>
                        {name}
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent>
                <DropdownMenuLabel 
                    className="text-lg">
                    {name}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {items.map((item, index) => (
                    <div className="flex flex-col gap-y-2">
                        <div className="flex gap-x-1 justify-between items-center">
                            <DropdownMenuItem key={index} className="text-md">
                                {item.title}
                            </DropdownMenuItem>

                            <div className="flex gap-x-2 items-center">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Share2 />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Move to other list</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Trash2 />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Delete from list</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Maximize />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <div className={styles.separator}></div>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}