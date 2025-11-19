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
import { ChangeLogEntry, getRingColor, getRingLightColor, RadarRing } from '../../../../../infrastructure';
import { useEffect } from 'react';

export const ChangeLogSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        const { changelogs, addChangeLog, clearChangeLog } = useChangelog();
        useEffect(() => {
            addChangeLog({
                itemTitle: "FTP",
                oldRing: RadarRing.SUSTAIN,
                newRing: RadarRing.HOLD
            })
            addChangeLog({
                itemTitle: "TypeScript",
                oldRing: RadarRing.TEST,
                newRing: RadarRing.ADOPT
            })
            addChangeLog({
                itemTitle: "Cypress",
                oldRing: RadarRing.SUSTAIN,
                newRing: RadarRing.TEST
            })
            addChangeLog({
                itemTitle: "Terraform",
                oldRing: RadarRing.TEST,
                newRing: RadarRing.ADOPT
            })
            addChangeLog({
                itemTitle: "Perl",
                oldRing: RadarRing.SUSTAIN,
                newRing: RadarRing.HOLD
            })
        }, [])

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
                    ${visible ? 'w-100' : 'w-0'}`
                    }>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel
                                className="font-semibold text-xl pt-2">
                                Registro de cambios
                            </SidebarGroupLabel>

                            <SidebarGroupContent className=''>
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

                                        <ScrollArea className="h-160">
                                            <div className="">

                                                {changelogs?.length === 0 ? (
                                                    <p className="text-md text-muted-foreground text-center py-4">
                                                        No hay cambios recientes
                                                    </p>
                                                ) : (
                                                    changelogs?.map((log: ChangeLogEntry, index: number) => (
                                                        <div key={index} className="text-md p-2 rounded w-full">
                                                            <p className='bg-gray-200 px-2 py-2 rounded-md flex flex-wrap items-center'>
                                                                <span>Elemento</span>
                                                                <span className='font-bold mx-1'>{log.itemTitle}</span>
                                                                <span>se ha movido de</span>
                                                                <span
                                                                    className='p-1 mx-1 rounded-lg font-semibold'
                                                                    style={{
                                                                        backgroundColor: getRingColor(log.oldRing),
                                                                        color: getRingLightColor(log.oldRing)
                                                                    }}
                                                                >{log.oldRing}</span>
                                                                <span>a</span>
                                                                <span
                                                                    className='p-1 mx-1 rounded-lg font-semibold'
                                                                    style={{
                                                                        backgroundColor: getRingColor(log.newRing),
                                                                        color: getRingLightColor(log.newRing)
                                                                    }}
                                                                >{log.newRing}</span>
                                                            </p>
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
                </Sidebar >
            </div >
        )
    };