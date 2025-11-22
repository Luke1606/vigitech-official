import React from 'react';
import {
    Blip,
    getRingColor,
    RadarQuadrant,
    RadarRing,
    generateBlipPositions,
    ringBounds,
    quadrantLabels,
    isTextOverlapping,
    useSurveyItems
} from '../../../../../infrastructure';
import { RadarMenu } from './radar-menu/RadarMenu.component';
import type { SurveyItem } from '../../../../../infrastructure';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

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
        const labelPositions: { x: number; y: number }[] = [];

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
                                                {/* Fondo del semicírculo */}
                                                <path
                                                    d="M 50,180 
                                               Q 200,30 350,180 
                                               L 350,180 
                                               L 50,180 Z"
                                                    fill="#f8f9fa"
                                                    stroke="#e9ecef"
                                                    strokeWidth="1"
                                                />

                                                {/* Anillos del semicírculo */}
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

                                                {/* Líneas divisorias del semicírculo */}
                                                <line x1="50" y1="180" x2="350" y2="180" stroke="#999" strokeWidth="1" />
                                                <line x1="200" y1="180" x2="200" y2="30" stroke="#999" strokeDasharray="4 2" />

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
                                                                e.stopPropagation();
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                handleBlipClick(blip, {
                                                                    x: rect.left + rect.width / 2,
                                                                    y: rect.top + rect.height / 2
                                                                });
                                                            }}
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {/* Círculo principal con transición suave - POSICIÓN FIJA */}
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
                                                                    className='pulseCircle'
                                                                />
                                                            )}

                                                            {/* MOSTRAR NOMBRE SOLO EN HOVER, NO EN SELECCIÓN */}
                                                            {isActive && !isSelected && (
                                                                <text
                                                                    x={8}
                                                                    y={-8}
                                                                    fontSize={10}
                                                                    fill="#000"
                                                                    fontWeight="bold"
                                                                    textAnchor="middle"
                                                                    style={{
                                                                        transition: 'opacity 0.3s ease',
                                                                        opacity: isActive ? 1 : 0
                                                                    }}
                                                                >
                                                                    {blip.title}
                                                                </text>
                                                            )}
                                                        </g>
                                                    );
                                                })}

                                                {/* Etiquetas de anillos en el semicírculo */}
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

                    {/* Menú contextual para móvil */}
                    {menuOpen && selectedBlip && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
                            <div
                                className="bg-white rounded-t-2xl w-full max-w-md p-4 animate-slide-up"
                                style={{
                                    position: 'fixed',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    maxHeight: '80vh',
                                    overflowY: 'auto'
                                }}
                            >
                                <RadarMenu
                                    item={selectedBlip as unknown as SurveyItem}
                                    position={{ x: 0, y: 0 }}
                                    onViewDetails={handleViewDetails}
                                    onUnsubscribe={handleUnsubscribe}
                                    onRemove={handleRemove}
                                    onSelect={handleSelect}
                                    onUnselect={handleUnselect}
                                    isSelected={false}
                                />
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Estilos CSS para la animación de pulso */}
                    <style>{`
                        @keyframes pulse {
                            0% {
                                transform: scale(1);
                                opacity: 0.6;
                            }
                            50% {
                                transform: scale(1.1);
                                opacity: 0.3;
                            }
                            100% {
                                transform: scale(1);
                                opacity: 0.6;
                            }
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
                                        className='pulseCircle'
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


            </div>
        )
    };