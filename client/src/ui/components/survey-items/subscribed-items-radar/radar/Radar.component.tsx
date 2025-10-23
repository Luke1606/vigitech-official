import React from 'react';
import { 
    Blip, 
    getRingColor, 
    RadarQuadrant, 
    RadarRing,
    generateBlipPositions, 
    ringBounds, 
    quadrantLabels, 
    isTextOverlapping 
} from '../../../../../infrastructure';

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
    const [hoveredBlipId, setHoveredBlipId] = React.useState<string | null>(null);
    const blipPositions = React.useMemo(() => generateBlipPositions(entries ?? []), [entries]);
    const labelPositions: { x: number; y: number }[] = [];

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
                    const quadrantBlips = entries.filter((b) => b.radarQuadrant === quadrant.label);
                    const column1 = quadrantBlips.slice(0, 10);
                    const column2 = quadrantBlips.slice(10);

                    return (
                        <g key={quadrant.label}>
                            <text
                                x={
                                    quadrant.label === RadarQuadrant.BUSSINESS_INTEL
                                        ? quadrant.x + 60
                                        :
                                        quadrant.label === RadarQuadrant.SCIENTIFIC_STAGE
                                            ?
                                            quadrant.x + 135
                                            : quadrant.x
                                }
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

                            {
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

                {/* Blips en el radar */}
                {(entries ?? []).map((blip) => {
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
                                onClick={() => onBlipClick?.(blip, { x, y })}
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
        </div >
    );
};
