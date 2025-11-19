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
                                    return titleX - 160; // 60px a la izquierda del título (más a la izquierda)
                                case RadarQuadrant.SCIENTIFIC_STAGE:
                                    return titleX - 235; // 60px a la izquierda del título (más a la izquierda)
                                case RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES:
                                    return titleX - 40; // 40px a la izquierda del título (posición normal)
                                case RadarQuadrant.LANGUAGES_AND_FRAMEWORKS:
                                    return titleX - 40; // 40px a la izquierda del título (posición normal)
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

                    {/* Blips en el radar (solo los de cuadrantes visibles) */}
                    {filteredEntries.map((blip) => {
                        const { x, y } = blipPositions[blip.id];
                        const isActive = hoveredBlipId === blip.id;

                        // Ajuste de posición del texto para evitar colisiones
                        const labelX = 10;
                        let labelY = 4;
                        while (isTextOverlapping(x + labelX, y + labelY, labelPositions)) {
                            labelY += 12;
                        }
                        labelPositions.push({ x: x + labelX, y: y + labelY });

                        const transform = isActive
                            ? `translate(${x}, ${y}) scale(1.5)`
                            : `translate(${x}, ${y})`;

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
                                style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                            >
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={8}
                                    fill={getRingColor(blip.radarRing)}
                                    stroke={isActive ? '#000' : '#333'}
                                    strokeWidth={isActive ? 2 : 1}
                                />
                                <text
                                    x={labelX}
                                    y={labelY}
                                    fontSize={16}
                                    fill={isActive ? '#000' : '#000'}
                                    fontWeight={isActive ? 'bold' : '500'}
                                >
                                    {blip.title}
                                </text>
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
                        isSelected={false} // Ajusta según tu lógica de selección
                    />
                )}
            </div >
        );
    };