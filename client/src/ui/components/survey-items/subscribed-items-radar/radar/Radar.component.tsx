import React from 'react';
import {
    Blip,
    getRingColor,
    RadarQuadrant,
    RadarRing,
    generateBlipPositions,
    ringBounds,
    quadrantLabels,
    useSurveyItems
} from '../../../../../infrastructure';
import { RadarMenu } from './radar-menu/RadarMenu.component';
import type { SurveyItem } from '../../../../../infrastructure';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Search, Upload, RefreshCw, Menu, X } from 'lucide-react';
import { Button } from '../../../../components/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/shared';
import { Input } from '../../../../components/shared';
import { Label } from '../../../../components/shared';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import * as XLSX from 'xlsx';
// Importar componentes de menú de shadcn
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../components/shared";

export const Radar: React.FC<{
    entries?: Blip[];
    onBlipClick?: (
        blip: Blip,
        position: {
            x: number;
            y: number
        }) => void;
    onBlipHover?: (
        blip: Blip
    ) => void;
}> = ({
    entries,
    onBlipClick,
    onBlipHover
}) => {
        const query = useSurveyItemsAPI();
        const navigate = useNavigate();
        const { addPendingUnsubscribes, addPendingRemoves } = useSurveyItems();
        const [hoveredBlipId, setHoveredBlipId] = React.useState<string | null>(null);
        const [menuOpen, setMenuOpen] = React.useState(false);
        const [selectedBlip, setSelectedBlip] = React.useState<Blip | null>(null);
        const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

        // Estado para controlar qué blip está seleccionado en la lista móvil
        const [selectedBlipId, setSelectedBlipId] = React.useState<string | null>(null);

        // Estado para controlar la visibilidad de los cuadrantes
        const [visibleQuadrants, setVisibleQuadrants] = React.useState<Record<RadarQuadrant, boolean>>(() => {
            const initialVisibility: Record<RadarQuadrant, boolean> = {
                [RadarQuadrant.BUSSINESS_INTEL]: true,
                [RadarQuadrant.SCIENTIFIC_STAGE]: true,
                [RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES]: true,
                [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]: true,
            };
            return initialVisibility;
        });

        // Estado para detectar si es móvil
        const [isMobile, setIsMobile] = React.useState(false);

        // Estado para el diálogo de búsqueda/importación
        const [searchDialogOpen, setSearchDialogOpen] = React.useState(false);
        const [searchTerm, setSearchTerm] = React.useState('');
        const [excelFile, setExcelFile] = React.useState<File | null>(null);
        const [excelError, setExcelError] = React.useState<string | null>(null);

        // Estados separados para el hover de cada botón en desktop
        const [isSearchButtonHovered, setIsSearchButtonHovered] = React.useState(false);
        const [isChangesButtonHovered, setIsChangesButtonHovered] = React.useState(false);

        // Estado para el loading de cambios
        const [isLoadingChanges, setIsLoadingChanges] = React.useState(false);

        // Estado para el menú móvil
        const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

        // Detectar cambio de tamaño de pantalla
        React.useEffect(() => {
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 768);
            };

            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        // Filtrar entradas basado en la visibilidad de cuadrantes
        const filteredEntries = React.useMemo(() => {
            return entries?.filter(blip => visibleQuadrants[blip.radarQuadrant]) ?? [];
        }, [entries, visibleQuadrants]);

        const blipPositions = React.useMemo(() => generateBlipPositions(filteredEntries), [filteredEntries]);

        // Determinar si el botón aceptar está habilitado
        const isAcceptEnabled = React.useMemo(() => {
            return (searchTerm.trim() !== '' && !excelFile) || (excelFile && searchTerm.trim() === '' && !excelError);
        }, [searchTerm, excelFile, excelError]);

        // Determinar si el input de búsqueda está deshabilitado
        const isSearchInputDisabled = React.useMemo(() => {
            return excelFile !== null;
        }, [excelFile]);

        // Determinar si el input de archivo está deshabilitado
        const isFileInputDisabled = React.useMemo(() => {
            return searchTerm.trim() !== '';
        }, [searchTerm]);

        // Colores para el botón de búsqueda de tecnología
        const searchButtonFillColor = isSearchButtonHovered ? '#1d4ed8' : '#2563eb'; // Azul oscuro en hover, azul normal por defecto
        const searchButtonStrokeColor = isSearchButtonHovered ? '#1e40af' : '#1d4ed8'; // Azul más oscuro en hover

        // Colores para el botón de buscar cambios
        const changesButtonFillColor = isChangesButtonHovered ? '#059669' : (isLoadingChanges ? '#059669' : '#10b981'); // Verde oscuro en hover, verde normal por defecto
        const changesButtonStrokeColor = isChangesButtonHovered ? '#047857' : (isLoadingChanges ? '#047857' : '#059669'); // Verde más oscuro en hover

        // Función para leer y validar el archivo Excel
        const readAndValidateExcel = (file: File): Promise<string[]> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Obtener la primera hoja
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Convertir a JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        if (jsonData.length === 0) {
                            reject(new Error('El archivo Excel está vacío'));
                            return;
                        }

                        // Obtener los headers (primera fila)
                        const headers = jsonData[0] as string[];

                        // Validar que solo haya una columna llamada "Titulo"
                        if (headers.length !== 1 || headers[0] !== 'Titulo') {
                            reject(new Error('El archivo Excel debe tener exactamente una columna con el nombre "Titulo"'));
                            return;
                        }

                        // Extraer los valores de la columna Titulo (excluyendo el header)
                        const titles: string[] = [];
                        for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i] as any[];
                            if (row && row[0] && typeof row[0] === 'string' && row[0].trim() !== '') {
                                titles.push(row[0].trim());
                            }
                        }

                        if (titles.length === 0) {
                            reject(new Error('No se encontraron valores válidos en la columna "Titulo"'));
                            return;
                        }

                        resolve(titles);
                    } catch (error) {
                        reject(new Error('Error al leer el archivo Excel: ' + (error as Error).message));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Error al leer el archivo'));
                };

                reader.readAsArrayBuffer(file);
            });
        };

        // Función para alternar la visibilidad de un cuadrante
        const toggleQuadrantVisibility = (quadrant: RadarQuadrant) => {
            setVisibleQuadrants(prev => ({
                ...prev,
                [quadrant]: !prev[quadrant]
            }));
        };

        // Manejador para cuando se hace clic en un blip
        const handleBlipClick = (blip: Blip, position: { x: number; y: number }) => {
            setSelectedBlip(blip);
            setMenuPosition(position);
            setMenuOpen(true);
            onBlipClick?.(blip, position);
        };

        // Manejador para seleccionar/deseleccionar blip en la lista móvil
        const handleMobileBlipSelect = (blip: Blip) => {
            if (selectedBlipId === blip.id) {
                // Si ya está seleccionado, deseleccionar
                setSelectedBlipId(null);
            } else {
                // Si no está seleccionado, seleccionar
                setSelectedBlipId(blip.id);
            }
        };

        // NUEVO MANEJADOR: Para seleccionar blip en el semicírculo y abrir menú
        const handleMobileBlipClick = (blip: Blip, position: { x: number; y: number }, event: React.MouseEvent) => {
            event.stopPropagation();

            // Seleccionar el blip (activar animación de pulso)
            setSelectedBlipId(blip.id);

            // Obtener la posición real del blip en la pantalla
            const svgElement = event.currentTarget.closest('svg');
            const svgRect = svgElement?.getBoundingClientRect();

            if (svgRect && position) {
                const scaleX = svgRect.width / 400;
                const scaleY = svgRect.height / 200;

                const screenX = svgRect.left + (position.x * scaleX);
                const screenY = svgRect.top + (position.y * scaleY);

                handleBlipClick(blip, {
                    x: screenX,
                    y: screenY
                });
            } else {
                handleBlipClick(blip, {
                    x: event.clientX,
                    y: event.clientY
                });
            }
        };

        // Manejadores para las acciones del menú
        const handleViewDetails = (item: SurveyItem) => {
            console.log('Ver detalles:', item);
            navigate(`/vigitech/technology-radar/item-details/${item.id}`)
            setMenuOpen(false);
        };

        const handleUnsubscribe = (items: SurveyItem[]) => {
            console.log('Dejar de seguir:', items);
            addPendingUnsubscribes(items);
            setMenuOpen(false);
        };

        const handleRemove = (items: SurveyItem[]) => {
            console.log('Eliminar:', items);
            addPendingRemoves(items);
            setMenuOpen(false);
        };

        const handleSelect = (item: SurveyItem) => {
            console.log('Seleccionar:', item);
            setMenuOpen(false);
        };

        const handleUnselect = (item: SurveyItem) => {
            console.log('Deseleccionar:', item);
            setMenuOpen(false);
        };

        // Manejadores para el diálogo de búsqueda/importación
        const handleOpenSearchDialog = () => {
            setMobileMenuOpen(false); // Cerrar el menú móvil
            setSearchDialogOpen(true);
        };

        const handleCloseSearchDialog = () => {
            setSearchDialogOpen(false);
            setSearchTerm('');
            setExcelFile(null);
            setExcelError(null);
        };

        const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchTerm(value);
            // Si se escribe algo, limpiar el archivo Excel
            if (value.trim() !== '') {
                setExcelFile(null);
                setExcelError(null);
            }
        };

        const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setExcelFile(file);
            setExcelError(null); // Limpiar errores anteriores

            if (file) {
                // Limpiar el término de búsqueda
                setSearchTerm('');

                try {
                    // Leer y validar el Excel
                    await readAndValidateExcel(file);
                    // Si la validación es exitosa, no hacemos nada más aquí
                    // Los títulos se leerán nuevamente en handleAccept
                } catch (error) {
                    const errorMessage = (error as Error).message;
                    setExcelError(errorMessage);
                    setExcelFile(null); // Limpiar el archivo si hay error

                    // Limpiar el input file
                    if (e.target) {
                        e.target.value = '';
                    }
                }
            }
        };

        // Función para buscar cambios (ejecuta query.subscribed)
        const handleSearchChanges = async () => {
            console.log('Buscando cambios...');
            setMobileMenuOpen(false); // Cerrar el menú móvil
            setIsLoadingChanges(true);
            try {
                await query.subscribed;
            } catch (error) {
                console.error('Error buscando cambios:', error);
            } finally {
                setIsLoadingChanges(false);
            }
        };

        const handleAccept = async () => {
            if (searchTerm.trim() !== '') {
                console.log('Buscando tecnología:', searchTerm);
                query.create(searchTerm);
                handleCloseSearchDialog();
            } else if (excelFile) {
                try {
                    console.log('Importando archivo Excel:', excelFile.name);

                    // Leer el archivo para obtener los títulos
                    const titles = await readAndValidateExcel(excelFile);
                    console.log('Títulos a importar:', titles);

                    // Llamar a createBatch con los títulos extraídos
                    query.createBatch(titles);

                    handleCloseSearchDialog();
                } catch (error) {
                    const errorMessage = (error as Error).message;
                    setExcelError(errorMessage);
                    // No cerrar el diálogo si hay error
                }
            }
        };

        // Cerrar menú cuando se hace clic fuera
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                setMenuOpen(false);
            };

            if (menuOpen) {
                document.addEventListener('click', handleClickOutside);
            }

            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }, [menuOpen]);

        // Effect: Cerrar el highlight cuando se hace clic fuera del listado
        React.useEffect(() => {
            const handleClickOutsideList = (event: MouseEvent) => {
                // Verificar si el clic fue fuera de cualquier listado de blips
                const target = event.target as HTMLElement;
                const isClickInsideList = target.closest('.blip-list-container');

                if (!isClickInsideList) {
                    setSelectedBlipId(null);
                }
            };

            if (isMobile) {
                document.addEventListener('click', handleClickOutsideList);
            }

            return () => {
                document.removeEventListener('click', handleClickOutsideList);
            };
        }, [isMobile]);

        // Función para generar posiciones de blips en semicírculo móvil
        const generateMobileBlipPositions = (blips: Blip[], quadrant: RadarQuadrant) => {
            const positions: Record<string, { x: number; y: number }> = {};
            const centerX = 200;
            const baseY = 180;

            // DEFINICIÓN DE ANILLOS CONTINUOS SIN ESPACIOS
            const ringRanges = {
                [RadarRing.ADOPT]: { min: 0, max: 80 },
                [RadarRing.TEST]: { min: 80, max: 120 },
                [RadarRing.SUSTAIN]: { min: 120, max: 160 },
                [RadarRing.HOLD]: { min: 160, max: 200 }
            };

            // Agrupar blips por ring
            const blipsByRing: Record<RadarRing, Blip[]> = {
                [RadarRing.ADOPT]: [],
                [RadarRing.TEST]: [],
                [RadarRing.SUSTAIN]: [],
                [RadarRing.HOLD]: []
            };

            blips.forEach(blip => {
                if (blipsByRing[blip.radarRing]) {
                    blipsByRing[blip.radarRing].push(blip);
                }
            });

            // Para cada ring, distribuir los blips uniformemente en el arco del semicírculo
            Object.entries(blipsByRing).forEach(([ring, ringBlips]) => {
                const radarRing = ring as RadarRing;
                const range = ringRanges[radarRing];

                // Calcular el radio medio dentro del rango del anillo
                const midRadius = (range.min + range.max) / 2;

                // Solo procesar si hay blips en este ring
                if (ringBlips.length > 0) {
                    ringBlips.forEach((blip, index) => {
                        // Distribuir uniformemente en el semicírculo del ring específico
                        const totalBlipsInRing = ringBlips.length;

                        // Calcular ángulo (evitando los extremos)
                        let angle;
                        if (totalBlipsInRing === 1) {
                            angle = Math.PI / 2; // Centro si solo hay uno
                        } else {
                            const margin = 0.2; // Margen para evitar bordes
                            angle = margin + (index / (totalBlipsInRing - 1)) * (Math.PI - 2 * margin);
                        }

                        // Calcular posición dentro del rango del anillo
                        const radius = midRadius;
                        const x = centerX + radius * Math.cos(angle);
                        const y = baseY - radius * Math.sin(angle);

                        positions[blip.id] = { x, y };
                    });
                }
            });

            return positions;
        };

        // Vista móvil - Cuadrantes apilados verticalmente como semicírculos
        if (isMobile) {
            return (
                <div className="w-full min-h-screen flex flex-col items-center py-4 px-2 bg-gray-50">
                    {/* Contenedor del menú móvil - CENTRADO HORIZONTALMENTE EN LA PARTE SUPERIOR */}
                    <div className="absolute top-18">
                        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-12 h-12 bg-white shadow-md border-gray-200 hover:bg-gray-50 transition-all duration-200"
                                >
                                    {mobileMenuOpen ? (
                                        <X size={24} className="text-gray-700" />
                                    ) : (
                                        <Menu size={24} className="text-gray-700" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-56 mt-2">
                                <DropdownMenuItem
                                    onClick={handleOpenSearchDialog}
                                    className="flex items-center cursor-pointer py-3"
                                >
                                    <Search size={18} className="mr-3" />
                                    <span className="text-base">Buscar Tecnología</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleSearchChanges}
                                    disabled={isLoadingChanges}
                                    className="flex items-center cursor-pointer py-3"
                                >
                                    {isLoadingChanges ? (
                                        <RefreshCw size={18} className="mr-3 animate-spin" />
                                    ) : (
                                        <RefreshCw size={18} className="mr-3" />
                                    )}
                                    <span className="text-base">{isLoadingChanges ? 'Buscando...' : 'Buscar Cambios'}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Contenedor de cuadrantes móviles */}
                    <div className="w-full max-w-md space-y-6">
                        {quadrantLabels.map((quadrant, index) => {
                            if (!entries) return null;

                            // Filtrar blips por cuadrante y visibilidad
                            const quadrantBlips = entries.filter((b) =>
                                b.radarQuadrant === quadrant.label && visibleQuadrants[quadrant.label]
                            );

                            // Generar posiciones específicas para móvil SOLO si hay blips
                            const mobileBlipPositions = quadrantBlips.length > 0
                                ? generateMobileBlipPositions(quadrantBlips, quadrant.label)
                                : {};

                            return (
                                <div
                                    key={quadrant.label}
                                    className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                                >
                                    {/* Header del cuadrante móvil */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleQuadrantVisibility(quadrant.label)}
                                                className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                {visibleQuadrants[quadrant.label] ? (
                                                    <Eye size={16} className="text-gray-700" />
                                                ) : (
                                                    <EyeOff size={16} className="text-gray-500" />
                                                )}
                                            </button>
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {quadrant.label}
                                            </h3>
                                        </div>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {quadrantBlips.length} items
                                        </span>
                                    </div>

                                    {/* Semicírculo del cuadrante móvil */}
                                    {visibleQuadrants[quadrant.label] && (
                                        <div className="relative w-full h-56 mb-4">
                                            <svg
                                                viewBox="0 0 400 200"
                                                className="w-full h-full"
                                                preserveAspectRatio="xMidYMid meet"
                                            >
                                                {/* 1. Fondo del semicírculo */}
                                                <path
                                                    d="M 50,180 
                                               Q 200,30 350,180 
                                               L 350,180 
                                               L 50,180 Z"
                                                    fill="#f8f9fa"
                                                    stroke="#e9ecef"
                                                    strokeWidth="1"
                                                />

                                                {/* 2. Anillos del semicírculo */}
                                                {[
                                                    { min: 0, max: 80, ring: RadarRing.ADOPT },
                                                    { min: 80, max: 120, ring: RadarRing.TEST },
                                                    { min: 120, max: 160, ring: RadarRing.SUSTAIN },
                                                    { min: 160, max: 200, ring: RadarRing.HOLD }
                                                ].map(({ min, max, ring }) => {
                                                    const centerX = 200;
                                                    const baseY = 180;

                                                    // Crear anillo con relleno
                                                    const path = `
        M ${centerX - max},${baseY}
        A ${max} ${max} 0 0 1 ${centerX + max},${baseY}
        L ${centerX + min},${baseY}
        A ${min} ${min} 0 0 0 ${centerX - min},${baseY}
        Z
    `;

                                                    return (
                                                        <path
                                                            key={ring}
                                                            d={path}
                                                            fill={getRingColor(ring)}
                                                            fillOpacity={0.2}
                                                            stroke={getRingColor(ring)}
                                                            strokeWidth={1}
                                                        />
                                                    );
                                                })}

                                                {/* 3. Líneas divisorias del semicírculo */}
                                                <line x1="50" y1="180" x2="350" y2="180" stroke="#999" strokeWidth="1" />
                                                <line x1="200" y1="180" x2="200" y2="30" stroke="#999" strokeDasharray="4 2" />

                                                {/* 4. Etiquetas de anillos en el semicírculo - RENDERIZAR ANTES DE LOS BLIPS */}
                                                <text x="200" y="135" fontSize="10" fill={getRingColor(RadarRing.ADOPT)} textAnchor="middle" fontWeight="bold">
                                                    ADOPTAR
                                                </text>
                                                <text x="200" y="90" fontSize="10" fill={getRingColor(RadarRing.TEST)} textAnchor="middle" fontWeight="bold">
                                                    PROBAR
                                                </text>
                                                <text x="200" y="45" fontSize="10" fill={getRingColor(RadarRing.SUSTAIN)} textAnchor="middle" fontWeight="bold">
                                                    EVALUAR
                                                </text>
                                                <text x="200" y="0" fontSize="10" fill={getRingColor(RadarRing.HOLD)} textAnchor="middle" fontWeight="bold">
                                                    DETENER
                                                </text>

                                                {/* 5. Blips en el semicírculo móvil - RENDERIZAR AL FINAL PARA QUE ESTÉN ENCIMA */}
                                                {quadrantBlips.map((blip) => {
                                                    const position = mobileBlipPositions[blip.id];

                                                    // Si no hay posición, no renderizar el blip
                                                    if (!position) {
                                                        console.warn(`No position found for blip: ${blip.id} in quadrant ${quadrant.label}`);
                                                        return null;
                                                    }

                                                    const isActive = hoveredBlipId === blip.id;
                                                    const isSelected = selectedBlipId === blip.id;

                                                    return (
                                                        <g
                                                            key={blip.id}
                                                            transform={`translate(${position.x}, ${position.y})`}
                                                            onMouseEnter={() => {
                                                                setHoveredBlipId(blip.id);
                                                                onBlipHover?.(blip);
                                                            }}
                                                            onMouseLeave={() => {
                                                                setHoveredBlipId(null);
                                                            }}
                                                            onClick={(e) => {
                                                                // USAR EL NUEVO MANEJADOR QUE ACTIVA LA ANIMACIÓN Y ABRE EL MENÚ
                                                                handleMobileBlipClick(blip, position, e);
                                                            }}
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {/* Círculo invisible más grande para mejor área de clic */}
                                                            <circle
                                                                cx={0}
                                                                cy={0}
                                                                r={20}
                                                                fill="transparent"
                                                            />

                                                            {/* Círculo principal con transición suave */}
                                                            <circle
                                                                cx={0}
                                                                cy={0}
                                                                r={isSelected ? 10 : 6}
                                                                fill={getRingColor(blip.radarRing)}
                                                                stroke={isSelected ? '#000' : (isActive ? '#000' : '#333')}
                                                                strokeWidth={isSelected ? 3 : (isActive ? 2 : 1)}
                                                                style={{
                                                                    transition: 'r 0.3s ease, stroke-width 0.3s ease, stroke 0.3s ease',
                                                                    transformOrigin: 'center center'
                                                                }}
                                                            />

                                                            {/* Efecto de pulso FIJADO en la posición del blip */}
                                                            {isSelected && (
                                                                <circle
                                                                    cx={0}
                                                                    cy={0}
                                                                    r={14}
                                                                    fill="none"
                                                                    stroke={getRingColor(blip.radarRing)}
                                                                    strokeWidth={6}
                                                                    className="pulseCircle"
                                                                />
                                                            )}

                                                            {/* ELIMINAR EL TEXTO DEL NOMBRE - SOLO MOSTRAR ANIMACIÓN DE PULSO */}
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    )}

                                    {/* Lista de blips del cuadrante - CON HIGHLIGHT MANTENIDO */}
                                    {visibleQuadrants[quadrant.label] && quadrantBlips.length > 0 && (
                                        <div className="mt-4 border-t border-gray-200 pt-4 blip-list-container">
                                            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                                                {quadrantBlips.map((blip) => {
                                                    const isSelected = selectedBlipId === blip.id;

                                                    return (
                                                        <div
                                                            key={blip.id}
                                                            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-all duration-300 border ${isSelected
                                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                                                }`}
                                                            onMouseEnter={() => setHoveredBlipId(blip.id)}
                                                            onMouseLeave={() => setHoveredBlipId(null)}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Manejar selección/deselección del blip
                                                                handleMobileBlipSelect(blip);
                                                            }}
                                                        >
                                                            <div
                                                                className="w-4 h-4 rounded-full flex-shrink-0 border border-white shadow-sm transition-all duration-300"
                                                                style={{
                                                                    backgroundColor: getRingColor(blip.radarRing),
                                                                    transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                                                                }}
                                                            />
                                                            <span className={`text-sm flex-1 transition-all duration-300 ${isSelected ? 'font-bold text-blue-900' :
                                                                hoveredBlipId === blip.id ? 'font-bold text-gray-900' : 'text-gray-700'
                                                                }`}>
                                                                {blip.title}
                                                            </span>
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded transition-all duration-300">
                                                                {blip.radarRing === RadarRing.ADOPT ? 'ADOPTAR' :
                                                                    blip.radarRing === RadarRing.TEST ? 'PROBAR' :
                                                                        blip.radarRing === RadarRing.SUSTAIN ? 'EVALUAR' :
                                                                            blip.radarRing === RadarRing.HOLD ? 'DETENER' : blip.radarRing}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Menú contextual para móvil - USANDO DIALOG DE SHADCN */}
                    {menuOpen && selectedBlip && (
                        <RadarMenu
                            item={selectedBlip as unknown as SurveyItem}
                            position={menuPosition}
                            onViewDetails={handleViewDetails}
                            onUnsubscribe={handleUnsubscribe}
                            onRemove={handleRemove}
                            onSelect={handleSelect}
                            onUnselect={handleUnselect}
                            isSelected={false}
                        />
                    )}

                    {/* Diálogo de búsqueda/importación */}
                    <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                    <Search size={20} />
                                    <span>Buscar o Importar Tecnología</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {/* Input de búsqueda por nombre */}
                                <div className="space-y-2">
                                    <Label htmlFor="technology-search">
                                        Buscar por nombre de tecnología
                                    </Label>
                                    <Input
                                        id="technology-search"
                                        placeholder="Escribe el nombre de la tecnología..."
                                        value={searchTerm}
                                        onChange={handleSearchTermChange}
                                        disabled={isSearchInputDisabled}
                                        className={isSearchInputDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
                                    />
                                    {isSearchInputDisabled && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Este campo está deshabilitado porque hay un archivo Excel seleccionado
                                        </p>
                                    )}
                                </div>

                                {/* Separador */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            O
                                        </span>
                                    </div>
                                </div>

                                {/* Input para importar Excel */}
                                <div className="space-y-2">
                                    <Label htmlFor="excel-import">
                                        Importar desde Excel
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="excel-import"
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleExcelFileChange}
                                            className={`flex-1 ${isFileInputDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                                            disabled={isFileInputDisabled}
                                        />
                                        <Upload
                                            size={16}
                                            className={`${isFileInputDisabled ? "text-gray-400" : "text-muted-foreground"}`}
                                        />
                                    </div>

                                    {/* Mostrar información del archivo */}
                                    {excelFile && (
                                        <p className="text-sm text-green-600">
                                            Archivo seleccionado: {excelFile.name}
                                        </p>
                                    )}

                                    {/* Mostrar error de validación */}
                                    {excelError && (
                                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                            {excelError}
                                        </p>
                                    )}

                                    {isFileInputDisabled && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Este campo está deshabilitado porque hay texto en la búsqueda
                                        </p>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCloseSearchDialog}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    disabled={!isAcceptEnabled}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    Aceptar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Estilos CSS para la animación de pulso */}
                    <style>{`
                        @keyframes pulse {
                            0% {
                                r: 14;
                                stroke-opacity: 0.6;
                            }
                            50% {
                                r: 18;
                                stroke-opacity: 0.3;
                            }
                            100% {
                                r: 14;
                                stroke-opacity: 0.6;
                            }
                        }
                        .pulseCircle {
                            animation: pulse 2s infinite;
                            transform-origin: center center;
                        }
                    `}</style>
                </div>
            );
        }

        // Vista desktop - Sin nombres de blips y con animación de pulso
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center overflow-x-hidden -mt-3 -mb-24">
                <svg
                    className="w-full h-auto"
                    viewBox="-500 -460 1000 1000"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
                >
                    {/* Grupo de botones DENTRO DEL SVG */}
                    <g className="transition-all duration-200 ease-in-out">
                        {/* Botón de Buscar Tecnología */}
                        <g
                            onClick={handleOpenSearchDialog}
                            onMouseEnter={() => setIsSearchButtonHovered(true)}
                            onMouseLeave={() => setIsSearchButtonHovered(false)}
                            style={{ cursor: 'pointer' }}
                            className="transition-all duration-200 ease-in-out"
                        >
                            {/* Fondo del botón */}
                            <rect
                                x="-190"
                                y="-440"
                                width="180"
                                height="36"
                                rx="6"
                                fill={searchButtonFillColor}
                                stroke={searchButtonStrokeColor}
                                strokeWidth="1"
                                className="transition-all duration-200 ease-in-out"
                            />

                            {/* Texto del botón */}
                            <text
                                x="-90"
                                y="-416"
                                fontSize="16"
                                fill="white"
                                textAnchor="middle"
                                fontWeight="500"
                                style={{ userSelect: 'none', pointerEvents: 'none' }}
                                className="transition-all duration-200 ease-in-out"
                            >
                                Buscar Tecnología
                            </text>

                            {/* Ícono de búsqueda */}
                            <g transform="translate(-170, -422)" style={{ pointerEvents: 'none' }}>
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="8"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    className="transition-all duration-200 ease-in-out"
                                />
                                <line
                                    x1="5.5"
                                    y1="5.5"
                                    x2="10"
                                    y2="10"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    className="transition-all duration-200 ease-in-out"
                                />
                            </g>
                        </g>

                        {/* NUEVO: Botón de Buscar Cambios */}
                        <g
                            onClick={handleSearchChanges}
                            onMouseEnter={() => setIsChangesButtonHovered(true)}
                            onMouseLeave={() => setIsChangesButtonHovered(false)}
                            style={{ cursor: 'pointer' }}
                            className="transition-all duration-200 ease-in-out"
                        >
                            {/* Fondo del botón (verde) */}
                            <rect
                                x="10"
                                y="-440"
                                width="180"
                                height="36"
                                rx="6"
                                fill={changesButtonFillColor}
                                stroke={changesButtonStrokeColor}
                                strokeWidth="1"
                                className="transition-all duration-200 ease-in-out"
                            />

                            {/* Texto del botón */}
                            <text
                                x="115"
                                y="-416"
                                fontSize="16"
                                fill="white"
                                textAnchor="middle"
                                fontWeight="500"
                                style={{ userSelect: 'none', pointerEvents: 'none' }}
                                className="transition-all duration-200 ease-in-out"
                            >
                                {isLoadingChanges ? 'Buscando...' : 'Buscar Cambios'}
                            </text>

                            {/* Ícono de refresh */}
                            <g transform="translate(35, -422)" style={{ pointerEvents: 'none' }}>
                                {isLoadingChanges ? (
                                    // Ícono de loading (spinner)
                                    <circle
                                        cx="0"
                                        cy="0"
                                        r="8"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        className="animate-spin"
                                    />
                                ) : (
                                    // Ícono de refresh normal
                                    <circle
                                        cx="0"
                                        cy="0"
                                        r="8"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        className="transition-all duration-200 ease-in-out"
                                    />
                                )}
                                {!isLoadingChanges && (
                                    <path
                                        d="M 4 -4 L 0 -8 L -4 -4 M 0 -8 L 0 6 M 4 4 L 0 8 L -4 4"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        fill="none"
                                        className="transition-all duration-200 ease-in-out"
                                    />
                                )}
                            </g>
                        </g>
                    </g>

                    {/* Sombreado por anillo */}
                    {(Object.entries(ringBounds) as [RadarRing, [number, number]][]).map(([ring, [rMin, rMax]]) => {
                        const color = getRingColor(ring);
                        const labelRadius = (rMin + rMax) / 2;

                        return (
                            <g key={ring}>
                                {/* Sombreado */}
                                <path
                                    d={`
                            M ${rMax} 0
                            A ${rMax} ${rMax} 0 1 0 ${-rMax} 0
                            A ${rMax} ${rMax} 0 1 0 ${rMax} 0
                            M ${rMin} 0
                            A ${rMin} ${rMin} 0 1 1 ${-rMin} 0
                            A ${rMin} ${rMin} 0 1 1 ${rMin} 0
                            Z
                        `}
                                    fill={color}
                                    opacity={0.08}
                                />

                                {/* Etiqueta del anillo */}
                                <text
                                    x={0}
                                    y={ring === RadarRing.ADOPT ? 0 : -labelRadius}
                                    fontSize={36}
                                    fontWeight="bold"
                                    fill={color}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {ring}
                                </text>
                            </g>
                        );
                    })}

                    {/* Anillos */}
                    {[140, 230, 310, 380].map((radious, index) => {
                        const ring = Object.keys(ringBounds)[index] as RadarRing;
                        return <circle key={index} r={radious} stroke={getRingColor(ring)} fill="none" strokeWidth={2} />;
                    })}

                    {/* Líneas divisorias más largas y espaciadas */}
                    <line x1={-380} y1={0} x2={380} y2={0} stroke="#999" strokeDasharray="6 6" />
                    <line x1={0} y1={-380} x2={0} y2={380} stroke="#999" strokeDasharray="6 6" />

                    {/* Etiquetas de cuadrantes y listas */}
                    {quadrantLabels.map((quadrant) => {
                        if (!entries) return null;

                        // Filtrar blips por cuadrante y visibilidad
                        const quadrantBlips = entries.filter((b) =>
                            b.radarQuadrant === quadrant.label && visibleQuadrants[quadrant.label]
                        );
                        const column1 = quadrantBlips.slice(0, 10);
                        const column2 = quadrantBlips.slice(10);

                        // Calcular posición del título
                        const titleX = quadrant.label === RadarQuadrant.BUSSINESS_INTEL
                            ? quadrant.x + 60
                            : quadrant.label === RadarQuadrant.SCIENTIFIC_STAGE
                                ? quadrant.x + 135
                                : quadrant.x;

                        // Calcular posición del botón (solo BUSSINESS_INTEL y SCIENTIFIC_STAGE se mueven más a la izquierda)
                        const getButtonX = () => {
                            switch (quadrant.label) {
                                case RadarQuadrant.BUSSINESS_INTEL:
                                    return titleX - 160;
                                case RadarQuadrant.SCIENTIFIC_STAGE:
                                    return titleX - 235;
                                case RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES:
                                    return titleX - 40;
                                case RadarQuadrant.LANGUAGES_AND_FRAMEWORKS:
                                    return titleX - 40;
                                default:
                                    return titleX - 40;
                            }
                        };

                        const buttonX = getButtonX();
                        const buttonY = quadrant.y - 18;

                        return (
                            <g key={quadrant.label}>
                                {/* Título del cuadrante con botón de ojo */}
                                <g>
                                    {/* Botón de ojo - AHORA A LA IZQUIERDA DEL TÍTULO */}
                                    <g
                                        onClick={() => toggleQuadrantVisibility(quadrant.label)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {/* Fondo del botón */}
                                        <rect
                                            x={buttonX}
                                            y={buttonY}
                                            width={24}
                                            height={24}
                                            rx={4}
                                            fill="#f0f0f0"
                                            stroke="#ccc"
                                            strokeWidth={1}
                                        />

                                        {/* Ícono de Lucide React */}
                                        <foreignObject
                                            x={buttonX}
                                            y={buttonY}
                                            width={24}
                                            height={24}
                                        >
                                            <div
                                                className="flex items-center justify-center w-6 h-6"
                                                style={{
                                                    pointerEvents: 'none',
                                                    width: '24px',
                                                    height: '24px'
                                                }}
                                            >
                                                {visibleQuadrants[quadrant.label] ? (
                                                    <Eye size={16} color="#333" />
                                                ) : (
                                                    <EyeOff size={16} color="#999" />
                                                )}
                                            </div>
                                        </foreignObject>
                                    </g>

                                    {/* Título del cuadrante */}
                                    <text
                                        x={titleX}
                                        y={quadrant.y}
                                        fontSize={22}
                                        fill="#333"
                                        textAnchor={
                                            quadrant.label === RadarQuadrant.BUSSINESS_INTEL ? 'middle' : quadrant.align
                                        }
                                        fontWeight="bold"
                                    >
                                        {quadrant.label}
                                    </text>
                                </g>

                                {/* Lista de blips del cuadrante (solo si está visible) */}
                                {visibleQuadrants[quadrant.label] &&
                                    [column1, column2].map((column, colIndex) =>
                                        column.map((b, j) => {
                                            const isActive = hoveredBlipId === b.id;
                                            const offsetX = colIndex === 0 ? 0 : 180;
                                            const baseX = quadrant.align === 'end' ? quadrant.x - 60 + offsetX : quadrant.x + 6 + offsetX;
                                            const textX = quadrant.align === 'end' ? quadrant.x - 48 + offsetX : quadrant.x + 18 + offsetX;
                                            const y = quadrant.y + 20 + j * 20;

                                            return (
                                                <g key={`${b.id}-label`}>
                                                    <circle cx={baseX} cy={y} r={7} fill={getRingColor(b.radarRing)} />
                                                    <text
                                                        x={textX}
                                                        y={y}
                                                        fontSize={18}
                                                        fill={isActive ? '#000' : '#444'}
                                                        fontWeight={isActive ? 'bold' : 'normal'}
                                                        textAnchor="start"
                                                        alignmentBaseline="middle"
                                                        onMouseEnter={() => setHoveredBlipId(b.id)}
                                                        onMouseLeave={() => setHoveredBlipId(null)}
                                                        className="cursor-pointer transition-all duration-200"
                                                    >
                                                        {b.title}
                                                    </text>
                                                </g>
                                            );
                                        })
                                    )
                                }
                            </g>
                        );
                    })}

                    {/* Blips en el radar (solo los de cuadrantes visibles) - SIN NOMBRES Y CON ANIMACIÓN DE PULSO */}
                    {filteredEntries.map((blip) => {
                        const { x, y } = blipPositions[blip.id];
                        const isActive = hoveredBlipId === blip.id;

                        const transform = `translate(${x}, ${y})`;

                        return (
                            <g
                                key={blip.id}
                                transform={transform}
                                onMouseEnter={() => {
                                    setHoveredBlipId(blip.id);
                                    onBlipHover?.(blip);
                                }}
                                onMouseLeave={() => {
                                    setHoveredBlipId(null);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlipClick(blip, { x: e.clientX, y: e.clientY });
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Círculo principal con transición suave */}
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={isActive ? 10 : 8}
                                    fill={getRingColor(blip.radarRing)}
                                    stroke={isActive ? '#000' : '#333'}
                                    strokeWidth={isActive ? 3 : 1}
                                    style={{
                                        transition: 'r 0.3s ease, stroke-width 0.3s ease, stroke 0.3s ease',
                                        transformOrigin: 'center center'
                                    }}
                                />

                                {/* Efecto de pulso cuando está activo (hover) */}
                                {isActive && (
                                    <circle
                                        cx={0}
                                        cy={0}
                                        r={14}
                                        fill="none"
                                        stroke={getRingColor(blip.radarRing)}
                                        strokeWidth={10}
                                        className="pulseCircle"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Menú contextual */}
                {menuOpen && selectedBlip && (
                    <RadarMenu
                        item={selectedBlip as unknown as SurveyItem}
                        position={menuPosition}
                        onViewDetails={handleViewDetails}
                        onUnsubscribe={handleUnsubscribe}
                        onRemove={handleRemove}
                        onSelect={handleSelect}
                        onUnselect={handleUnselect}
                        isSelected={false}
                    />
                )}

                {/* Diálogo de búsqueda/importación */}
                <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <Search size={20} />
                                <span>Buscar o Importar Tecnología</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Input de búsqueda por nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="technology-search">
                                    Buscar por nombre de tecnología
                                </Label>
                                <Input
                                    id="technology-search"
                                    placeholder="Escribe el nombre de la tecnología..."
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                    disabled={isSearchInputDisabled}
                                    className={isSearchInputDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
                                />
                                {isSearchInputDisabled && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Este campo está deshabilitado porque hay un archivo Excel seleccionado
                                    </p>
                                )}
                            </div>

                            {/* Separador */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        O
                                    </span>
                                </div>
                            </div>

                            {/* Input para importar Excel */}
                            <div className="space-y-2">
                                <Label htmlFor="excel-import">
                                    Importar desde Excel
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="excel-import"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleExcelFileChange}
                                        className={`flex-1 ${isFileInputDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                                        disabled={isFileInputDisabled}
                                    />
                                    <Upload
                                        size={16}
                                        className={`${isFileInputDisabled ? "text-gray-400" : "text-muted-foreground"}`}
                                    />
                                </div>

                                {/* Mostrar información del archivo */}
                                {excelFile && (
                                    <p className="text-sm text-green-600">
                                        Archivo seleccionado: {excelFile.name}
                                    </p>
                                )}

                                {/* Mostrar error de validación */}
                                {excelError && (
                                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                        {excelError}
                                    </p>
                                )}

                                {isFileInputDisabled && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Este campo está deshabilitado porque hay texto en la búsqueda
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleCloseSearchDialog}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={!isAcceptEnabled}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Aceptar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    };