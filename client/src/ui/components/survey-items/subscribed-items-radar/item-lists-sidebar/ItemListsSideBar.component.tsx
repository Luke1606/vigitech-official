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

export const ItemListsSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({ 
    visible, 
    toggleVisible 
}) => {
    const [ lists, setLists ] = useState<UserItemList[]>([]);
    return (
        <>
            <Button
                type='button'
                onClick={toggleVisible}>
                { visible?
                    <>
                        <EyeOff/>
                        Collapse
                    </>
                    :
                    <>
                        <EyeIcon/>
                        Collapse
                    </>
                }
            </Button>

            <Sidebar
                side='left'
                className={`my-12 transition-all duration-300 
                    ${visible ? 'w-80' : 'w-collapsed'}`
                }>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel
                            className="font-semibold">
                            Custom Item Lists
                        </SidebarGroupLabel>
                        
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {(!lists || lists?.length === 0) ?
                                    <SidebarMenuItem key='none'>
                                        <p>No hay listas</p>
                                        <SidebarMenuButton asChild>
                                            <Button onClick={
                                                () => setLists(
                                                    (prev: UserItemList[]) => ([
                                                        ...prev,
                                                        { name: 'default', items: []}
                                                    ]) 
                                                )}>
                                                <Plus />
                                                Crear
                                            </Button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    :
                                    lists.map(
                                        (list: UserItemList) =>
                                            <SidebarMenuItem key={list.name}>
                                                <CustomItemsList
                                                    name={list.name}
                                                    items={list.items} 
                                                    />
                                            </SidebarMenuItem> 
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            
            {/* Aqui mostrar un dialog con un input para escribir el nombre de la lista */}
        </>
    )
};