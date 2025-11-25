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
import { ChangeLogEntry, RadarRing } from '../../../../../infrastructure';
import { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';

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

        // Mapeo de colores RGB para cada anillo - TODOS con texto blanco
        const ringColors = {
            [RadarRing.ADOPT]: { background: '34 197 94', text: '255 255 255' },    // green-500, texto blanco
            [RadarRing.TEST]: { background: '234 179 8', text: '255 255 255' },     // yellow-500, texto blanco
            [RadarRing.SUSTAIN]: { background: '249 115 22', text: '255 255 255' }, // orange-500, texto blanco
            [RadarRing.HOLD]: { background: '239 68 68', text: '255 255 255' }      // red-500, texto blanco
        };

        // Función para convertir RGB a formato ARGB de Excel
        const rgbToArgb = (rgb: string): string => {
            const [r, g, b] = rgb.split(' ').map(Number);
            // Formato ARGB: FF + RR + GG + BB
            return `FF${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        };

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

        // Función para descargar el registro de cambios como Excel con estilos reales
        const downloadChangeLog = async () => {
            if (changelogs.length === 0) return;

            // Crear un nuevo workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Radar Tecnológico';
            workbook.created = new Date();

            // Añadir una hoja
            const worksheet = workbook.addWorksheet('Registro de Cambios');

            // Título principal
            const titleRow = worksheet.getRow(1);
            titleRow.getCell(1).value = 'REGISTRO DE CAMBIOS - RADAR TECNOLÓGICO';
            worksheet.mergeCells('A1:E1');
            titleRow.height = 30;
            titleRow.getCell(1).font = {
                name: 'Arial',
                size: 16,
                bold: true,
                color: { argb: 'FFFFFF' }
            };
            titleRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '2F5597' }
            };
            titleRow.getCell(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            titleRow.getCell(1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Información de fecha/hora
            worksheet.getCell('A3').value = 'Fecha de generación:';
            worksheet.getCell('B3').value = currentDate;
            worksheet.getCell('A4').value = 'Hora de generación:';
            worksheet.getCell('B4').value = currentTime;
            worksheet.getCell('A5').value = 'Zona horaria:';
            worksheet.getCell('B5').value = timeZone;

            // Estilo para la información
            for (let i = 3; i <= 5; i++) {
                const labelCell = worksheet.getCell(`A${i}`);
                const valueCell = worksheet.getCell(`B${i}`);

                labelCell.font = {
                    name: 'Arial',
                    size: 10,
                    bold: true
                };

                valueCell.font = {
                    name: 'Arial',
                    size: 10
                };
            }

            // Encabezados de la tabla (fila 7)
            const headers = ['No.', 'ELEMENTO', 'ANILLO ANTERIOR', 'ANILLO ACTUAL', 'FECHA DE CAMBIO'];
            const headerRow = worksheet.getRow(7);

            headers.forEach((header, index) => {
                const cell = headerRow.getCell(index + 1);
                cell.value = header;
                cell.font = {
                    name: 'Arial',
                    size: 11,
                    bold: true,
                    color: { argb: 'FFFFFF' }
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '70AD47' }
                };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center'
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            headerRow.height = 25;

            // Datos de la tabla
            changelogs.forEach((log, index) => {
                const rowNumber = 8 + index;
                const row = worksheet.getRow(rowNumber);

                const cells = [
                    index + 1,
                    log.itemTitle,
                    log.oldRing.toUpperCase(), // Convertir a mayúsculas
                    log.newRing.toUpperCase(), // Convertir a mayúsculas
                    new Date().toLocaleDateString('es-ES')
                ];

                cells.forEach((value, cellIndex) => {
                    const cell = row.getCell(cellIndex + 1);
                    cell.value = value;

                    // Estilo base para todas las celdas
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    // Alineación específica
                    if (cellIndex === 0) { // Columna No.
                        cell.alignment = { horizontal: 'center' };
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' }
                        };
                        cell.font = {
                            name: 'Arial',
                            size: 10,
                            color: { argb: 'FF000000' }
                        };
                    }
                    // Columna ELEMENTO
                    else if (cellIndex === 1) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' }
                        };
                        cell.font = {
                            name: 'Arial',
                            size: 10,
                            color: { argb: 'FF000000' }
                        };
                    }
                    // Columna ANILLO ANTERIOR
                    else if (cellIndex === 2) {
                        const ringColor = ringColors[log.oldRing as RadarRing];
                        const backgroundColor = rgbToArgb(ringColor.background);
                        const textColor = rgbToArgb(ringColor.text);

                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: backgroundColor }
                        };
                        cell.font = {
                            name: 'Arial',
                            size: 10,
                            bold: true,
                            color: { argb: textColor }
                        };
                        cell.alignment = {
                            horizontal: 'center',
                            vertical: 'middle'
                        };
                    }
                    // Columna ANILLO ACTUAL
                    else if (cellIndex === 3) {
                        const ringColor = ringColors[log.newRing as RadarRing];
                        const backgroundColor = rgbToArgb(ringColor.background);
                        const textColor = rgbToArgb(ringColor.text);

                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: backgroundColor }
                        };
                        cell.font = {
                            name: 'Arial',
                            size: 10,
                            bold: true,
                            color: { argb: textColor }
                        };
                        cell.alignment = {
                            horizontal: 'center',
                            vertical: 'middle'
                        };
                    }
                    // Columna FECHA DE CAMBIO
                    else if (cellIndex === 4) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' }
                        };
                        cell.font = {
                            name: 'Arial',
                            size: 10,
                            color: { argb: 'FF000000' }
                        };
                        cell.alignment = {
                            horizontal: 'center',
                            vertical: 'middle'
                        };
                    }
                });

                row.height = 20;
            });

            // Pie de página
            const footerRowNumber = 8 + changelogs.length + 1;
            worksheet.mergeCells(`A${footerRowNumber}:E${footerRowNumber}`);
            const footerCell = worksheet.getCell(`A${footerRowNumber}`);
            footerCell.value = `Total de cambios registrados: ${changelogs.length}`;
            footerCell.font = {
                name: 'Arial',
                size: 11,
                bold: true,
                color: { argb: '2F5597' }
            };
            footerCell.alignment = {
                horizontal: 'center'
            };

            // Ajustar anchos de columna
            worksheet.columns = [
                { width: 6 },   // No.
                { width: 35 },  // ELEMENTO
                { width: 22 },  // ANILLO ANTERIOR
                { width: 22 },  // ANILLO ACTUAL
                { width: 22 }   // FECHA DE CAMBIO
            ];

            // Generar buffer y descargar
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registro-cambios-${currentDate.replace(/\//g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
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
                                                                backgroundColor: `rgb(${ringColors[log.oldRing as RadarRing].background})`,
                                                                color: `rgb(${ringColors[log.oldRing as RadarRing].text})`
                                                            }}
                                                        >{log.oldRing.toUpperCase()}</span>
                                                        <span>a</span>
                                                        <span
                                                            className='p-1 mx-1 rounded-lg font-semibold'
                                                            style={{
                                                                backgroundColor: `rgb(${ringColors[log.newRing as RadarRing].background})`,
                                                                color: `rgb(${ringColors[log.newRing as RadarRing].text})`
                                                            }}
                                                        >{log.newRing.toUpperCase()}</span>
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
                                                            backgroundColor: `rgb(${ringColors[log.oldRing as RadarRing].background})`,
                                                            color: `rgb(${ringColors[log.oldRing as RadarRing].text})`
                                                        }}
                                                    >{log.oldRing.toUpperCase()}</span>
                                                    <span>a</span>
                                                    <span
                                                        className='p-1 mx-1 rounded-lg font-semibold'
                                                        style={{
                                                            backgroundColor: `rgb(${ringColors[log.newRing as RadarRing].background})`,
                                                            color: `rgb(${ringColors[log.newRing as RadarRing].text})`
                                                        }}
                                                    >{log.newRing.toUpperCase()}</span>
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