import { Clock, EyeIcon, EyeOff, Trash2 } from 'lucide-react';
import {
    Button,
    ScrollArea,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from '../../..';
import { useChangelog } from '../../../../../infrastructure/hooks/use-changelog';

export const ChangeLogSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        const { changelogs, clearChangeLog } = useChangelog();

        return (
            <div className='flex mt-8 gap-x-20'>
                <Button
                    className='absolute bottom-5 right-5 z-40'
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
                    side='right'
                    className={`my-12 transition-all duration-300
                    ${visible ? 'w-80' : 'w-0'}`
                    }>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel
                                className="font-semibold text-xl pt-2">
                                Registro de cambios
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                            </div>

                                            {changelogs?.length > 0 && (
                                                <Button variant="ghost" size="sm" onClick={clearChangeLog}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>

                                        <ScrollArea className="h-48">
                                            <div className="space-y-2">

                                                {changelogs?.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-4">
                                                        No hay cambios recientes
                                                    </p>
                                                ) : (
                                                    changelogs?.map((log: string, index: number) => (
                                                        <div key={index} className="text-xs p-2 bg-muted rounded">
                                                            {log}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </div>
        )
    };