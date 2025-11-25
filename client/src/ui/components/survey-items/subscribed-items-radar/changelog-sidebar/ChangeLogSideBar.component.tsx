import { Clock, EyeIcon, EyeOff, Trash2, List, Download } from 'lucide-react';
import {
    Button,
    ScrollArea,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../..';
import { useChangelog } from '../../../../../infrastructure/hooks/use-changelog';
import { ChangeLogEntry, getRingColor, getRingLightColor, RadarRing } from '../../../../../infrastructure';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export const ChangeLogSideBar: React.FC<{
    visible: boolean
    toggleVisible: () => void
}> = ({
    visible,
    toggleVisible
}) => {
        const { changelogs, addChangeLog, clearChangeLog } = useChangelog();
        const [isMobile, setIsMobile] = useState(false);
        const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
        const [currentDate, setCurrentDate] = useState('');
        const [currentTime, setCurrentTime] = useState('');
        const [timeZone, setTimeZone] = useState('');

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

        // Actualizar la fecha, hora actual y zona horaria cada segundo
        useEffect(() => {
            const updateDateTime = () => {
                const now = new Date();

                // Formatear fecha
                const dateString = now.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Formatear hora
                const timeString = now.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                // Obtener zona horaria en español
                let zonaHoraria = '';
                try {
                    const formatter = new Intl.DateTimeFormat('es-ES', {
                        timeZoneName: 'long'
                    });
                    const parts = formatter.formatToParts(now);
                    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
                    zonaHoraria = timeZonePart ? timeZonePart.value : 'Hora local';
                } catch (error) {
                    // Fallback: mostrar el offset
                    const offset = -now.getTimezoneOffset() / 60;
                    zonaHoraria = `UTC${offset >= 0 ? '+' : ''}${offset}`;
                }

                setCurrentDate(dateString);
                setCurrentTime(timeString);
                setTimeZone(zonaHoraria);
            };

            updateDateTime(); // Actualizar inmediatamente
            const interval = setInterval(updateDateTime, 1000);

            return () => {
                clearInterval(interval);
            };
        }, []);

        // Función para descargar el registro de cambios como Excel
        const downloadChangeLog = () => {
            if (changelogs.length === 0) return;

            // Crear datos para el Excel
            const excelData = [
                // Encabezado con fecha, hora y zona horaria
                ['Registro de Cambios'],
                [`Fecha: ${currentDate}`],
                [`Hora: ${currentTime}`],
                [`Zona Horaria: ${timeZone}`],
                [], // Línea en blanco
                // Encabezados de la tabla
                ['Elemento', 'Anillo Viejo', 'Anillo Nuevo'],
                // Datos
                ...changelogs.map(log => [log.itemTitle, log.oldRing, log.newRing])
            ];

            // Crear libro de trabajo y hoja
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(excelData);

            // Estilos básicos para el encabezado
            if (!ws['!merges']) ws['!merges'] = [];

            // Aplicar estilos al encabezado
            const headerRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } };
            if (!ws['!merges']) ws['!merges'] = [];
            ws['!merges'].push(headerRange);

            // Ajustar anchos de columna
            ws['!cols'] = [
                { wch: 30 }, // Elemento
                { wch: 15 }, // Anillo Viejo
                { wch: 15 }  // Anillo Nuevo
            ];

            // Añadir hoja al libro
            XLSX.utils.book_append_sheet(wb, ws, 'Registro de Cambios');

            // Generar archivo y descargar
            const fileName = `registro-cambios-${currentDate.replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(wb, fileName);
        };

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

        const handleMobileToggle = () => {
            if (isMobile) {
                setMobileDialogOpen(!mobileDialogOpen);
            } else {
                toggleVisible();
            }
        };

        // Controles con fecha, hora actual y botones (reutilizable)
        const controlsContent = (
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                            {currentDate}
                        </span>
                        <span className="text-xs text-gray-500">
                            {currentTime} • {timeZone}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {changelogs?.length > 0 && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={downloadChangeLog}
                                title="Descargar registro en Excel"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearChangeLog}
                                title="Limpiar registro"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );

        // Contenido reutilizable para ambos casos (sidebar y dialog)
        const changelogContent = (
            <>
                <SidebarGroup>
                    <SidebarGroupLabel className="font-semibold text-xl pt-2">
                        Registro de cambios
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="border-t pt-4 mt-4">
                                {controlsContent}

                                <ScrollArea className="h-160 pb-5">
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
            </>
        );

        return (
            <div className='flex mt-8 gap-x-20 lg:mb-0 mb-24'>
                {/* Botón para móvil - posición fixed en la parte superior derecha */}
                {isMobile && (
                    <Button
                        className='fixed top-20 right-4 z-50 flex items-center gap-2 shadow-lg'
                        type='button'
                        onClick={handleMobileToggle}
                        size="sm"
                    >
                        <List className="h-4 w-4" />
                        Cambios
                    </Button>
                )}

                {/* Botón para desktop - posición original */}
                {!isMobile && (
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
                )}

                {/* Sidebar para desktop */}
                {!isMobile && (
                    <Sidebar
                        side='right'
                        className={`my-12 transition-all duration-300
                        ${visible ? 'w-100' : 'w-0'}`}>
                        <SidebarContent>
                            {changelogContent}
                        </SidebarContent>
                    </Sidebar>
                )}

                {/* Dialog para móvil - Estructura mejorada */}
                {isMobile && (
                    <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
                        <DialogContent className="max-w-[90vw] h-[80vh] flex flex-col p-0">
                            <DialogHeader className="px-6 py-4 border-b">
                                <DialogTitle className="text-xl">Registro de cambios</DialogTitle>
                            </DialogHeader>

                            {/* Controles fijos (no scrolleables) con fecha y hora actual */}
                            <div className="px-6 py-3 border-b">
                                {controlsContent}
                            </div>

                            {/* Contenedor scrolleable solo para los mensajes de cambios */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {changelogs?.length === 0 ? (
                                    <p className="text-md text-muted-foreground text-center py-4">
                                        No hay cambios recientes
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {changelogs?.map((log: ChangeLogEntry, index: number) => (
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div >
        )
    };