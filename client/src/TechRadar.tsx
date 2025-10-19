import React from 'react';

type Ring = 'Adoptar' | 'Probar' | 'Evaluar' | 'Evitar';
type Quadrant = 'Lenguajes' | 'Herramientas' | 'Infraestructura' | 'Técnicas';

interface Blip {
    id: string;
    name: string;
    quadrant: Quadrant;
    ring: Ring;
}

const blips: Blip[] = [
    // Originales
    { id: '1', name: 'TypeScript', quadrant: 'Lenguajes', ring: 'Adoptar' },
    { id: '2', name: 'Rust', quadrant: 'Lenguajes', ring: 'Probar' },
    { id: '3', name: 'Kotlin', quadrant: 'Lenguajes', ring: 'Evaluar' },
    { id: '4', name: 'Perl', quadrant: 'Lenguajes', ring: 'Evitar' },
    { id: '5', name: 'React Query', quadrant: 'Herramientas', ring: 'Adoptar' },
    { id: '6', name: 'Playwright', quadrant: 'Herramientas', ring: 'Probar' },
    { id: '7', name: 'Vite', quadrant: 'Herramientas', ring: 'Evaluar' },
    { id: '8', name: 'Gulp', quadrant: 'Herramientas', ring: 'Evitar' },
    { id: '9', name: 'Docker', quadrant: 'Infraestructura', ring: 'Adoptar' },
    { id: '10', name: 'Kubernetes', quadrant: 'Infraestructura', ring: 'Probar' },
    { id: '11', name: 'Nomad', quadrant: 'Infraestructura', ring: 'Evaluar' },
    { id: '12', name: 'FTP', quadrant: 'Infraestructura', ring: 'Evitar' },
    { id: '13', name: 'Redux Toolkit', quadrant: 'Técnicas', ring: 'Adoptar' },
    { id: '14', name: 'Server Components', quadrant: 'Técnicas', ring: 'Probar' },
    { id: '15', name: 'Microfrontends', quadrant: 'Técnicas', ring: 'Evaluar' },
    { id: '16', name: 'jQuery Plugins', quadrant: 'Técnicas', ring: 'Evitar' },
    // Nuevos
    { id: '17', name: 'Go', quadrant: 'Lenguajes', ring: 'Adoptar' },
    { id: '18', name: 'Elm', quadrant: 'Lenguajes', ring: 'Probar' },
    { id: '19', name: 'Dart', quadrant: 'Lenguajes', ring: 'Evaluar' },
    { id: '20', name: 'Visual Basic', quadrant: 'Lenguajes', ring: 'Evitar' },
    { id: '21', name: 'ESLint', quadrant: 'Herramientas', ring: 'Adoptar' },
    { id: '22', name: 'Cypress', quadrant: 'Herramientas', ring: 'Probar' },
    { id: '23', name: 'Snowpack', quadrant: 'Herramientas', ring: 'Evaluar' },
    { id: '24', name: 'Bower', quadrant: 'Herramientas', ring: 'Evitar' },
    { id: '25', name: 'Terraform', quadrant: 'Infraestructura', ring: 'Adoptar' },
    { id: '26', name: 'Consul', quadrant: 'Infraestructura', ring: 'Probar' },
    { id: '27', name: 'Podman', quadrant: 'Infraestructura', ring: 'Evaluar' },
    { id: '28', name: 'Telnet', quadrant: 'Infraestructura', ring: 'Evitar' },
    { id: '29', name: 'Atomic Design', quadrant: 'Técnicas', ring: 'Adoptar' },
    { id: '30', name: 'Feature Flags', quadrant: 'Técnicas', ring: 'Probar' },
    { id: '31', name: 'Serverless Patterns', quadrant: 'Técnicas', ring: 'Evaluar' },
    { id: '32', name: 'CSS Hacks', quadrant: 'Técnicas', ring: 'Evitar' },
];

const ringBounds: Record<Ring, [number, number]> = {
    Adoptar: [0, 140],
    Probar: [140, 230],
    Evaluar: [230, 310],
    Evitar: [310, 380],
};

const ringColors: Record<Ring, string> = {
    Adoptar: '#5ba300',
    Probar: '#009eb0',
    Evaluar: '#c7ba00',
    Evitar: '#e09b96',
};

const quadrantAngles: Record<Quadrant, [number, number]> = {
    Técnicas: [0, Math.PI / 2],
    Infraestructura: [Math.PI / 2, Math.PI],
    Herramientas: [Math.PI, (3 * Math.PI) / 2],
    Lenguajes: [(3 * Math.PI) / 2, 2 * Math.PI],
};

function generateNonCollidingPosition(
    ring: Ring,
    quadrant: Quadrant,
    existing: { x: number; y: number }[],
    minDistance = 24,
    maxAttempts = 100
): { x: number; y: number } {
    const [rMin, rMax] = ringBounds[ring];
    const [aMin, aMax] = quadrantAngles[quadrant];
    const safeRMin = rMin + 12;
    const safeRMax = rMax - 12;
    const safeAMin = aMin + 0.1;
    const safeAMax = aMax - 0.1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const radius = Math.sqrt(Math.random() * (safeRMax ** 2 - safeRMin ** 2) + safeRMin ** 2);
        const angle = Math.random() * (safeAMax - safeAMin) + safeAMin;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const tooClose = existing.some((p) => {
            const dx = p.x - x;
            const dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });

        if (!tooClose) return { x, y };
    }

    return { x: 0, y: 0 };
}

function generateBlipPositions(blips: Blip[]): Record<string, { x: number; y: number }> {
    const placed: { x: number; y: number }[] = [];
    const positions: Record<string, { x: number; y: number }> = {};

    for (const blip of blips) {
        const pos = generateNonCollidingPosition(blip.ring, blip.quadrant, placed);
        placed.push(pos);
        positions[blip.id] = pos;
    }

    return positions;
}

function isTextOverlapping(x: number, y: number, existing: { x: number; y: number }[], threshold = 20): boolean {
    return existing.some((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    });
}

const quadrantLabels: { label: Quadrant; x: number; y: number; align: 'start' | 'end' }[] = [
    { label: 'Lenguajes', x: 500, y: -300, align: 'start' },
    { label: 'Herramientas', x: -750, y: -300, align: 'end' },
    { label: 'Infraestructura', x: -750, y: 100, align: 'end' },
    { label: 'Técnicas', x: 500, y: 100, align: 'start' },
];

const TechRadar: React.FC = () => {
    const [hoveredBlipId, setHoveredBlipId] = React.useState<string | null>(null);
    const blipPositions = React.useMemo(() => generateBlipPositions(blips), []);
    const labelPositions: { x: number; y: number }[] = [];

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center overflow-x-hidden">
            <svg
                className="w-full h-auto"
                viewBox="-500 -500 1000 1000"
                preserveAspectRatio="xMidYMid meet"
                style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
            >
                {/* Sombreado por anillo */}
                {(Object.entries(ringBounds) as [Ring, [number, number]][]).map(([ring, [rMin, rMax]]) => {
                    const color = ringColors[ring];
                    return (
                        <path
                            key={ring}
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
                    );
                })}

                {/* Anillos */}
                {[140, 230, 310, 380].map((r, i) => {
                    const ring = Object.keys(ringBounds)[i] as Ring;
                    return <circle key={i} r={r} stroke={ringColors[ring]} fill="none" strokeWidth={2} />;
                })}

                {/* Líneas divisorias más largas y espaciadas */}
                <line x1={-380} y1={0} x2={380} y2={0} stroke="#999" strokeDasharray="6 6" />
                <line x1={0} y1={-380} x2={0} y2={380} stroke="#999" strokeDasharray="6 6" />

                {/* Etiquetas de cuadrantes y listas */}
                {quadrantLabels.map((q) => {
                    const quadrantBlips = blips.filter((b) => b.quadrant === q.label);
                    const column1 = quadrantBlips.slice(0, 10);
                    const column2 = quadrantBlips.slice(10);

                    const items = blips
                        .filter((b) => b.quadrant === q.label)
                        .map((b, j) => {
                            const isActive = hoveredBlipId === b.id;
                            return (
                                <g key={`${b.id}-label`}>
                                    <circle
                                        cx={q.align === 'end' ? q.x - 60 : q.x + 6}
                                        cy={q.y + 20 + j * 20}
                                        r={7}
                                        fill={ringColors[b.ring]}
                                    />
                                    <text
                                        x={q.align === 'end' ? q.x - 48 : q.x + 18}
                                        y={q.y + 20 + j * 20}
                                        fontSize={18}
                                        fill={isActive ? '#000' : '#444'}
                                        fontWeight={isActive ? 'bold' : 'normal'}
                                        textAnchor="start"
                                        alignmentBaseline="middle"
                                        onMouseEnter={() => setHoveredBlipId(b.id)}
                                        onMouseLeave={() => setHoveredBlipId(null)}
                                        className="cursor-pointer transition-all duration-200"
                                    >
                                        {b.name}
                                    </text>
                                </g>
                            );
                        });

                    return (
                        <g key={q.label}>
                            <text
                                x={q.x}
                                y={q.y}
                                fontSize={22}
                                fill="#333"
                                textAnchor={q.align}
                                fontWeight="bold"
                            >
                                {q.label}
                            </text>

                            {[column1, column2].map((column, colIndex) =>
                                column.map((b, j) => {
                                    const isActive = hoveredBlipId === b.id;
                                    const offsetX = colIndex === 0 ? 0 : 180; // separación horizontal entre columnas
                                    const baseX = q.align === 'end' ? q.x - 60 + offsetX : q.x + 6 + offsetX;
                                    const textX = q.align === 'end' ? q.x - 48 + offsetX : q.x + 18 + offsetX;
                                    const y = q.y + 20 + j * 20;

                                    return (
                                        <g key={`${b.id}-label`}>
                                            <circle cx={baseX} cy={y} r={7} fill={ringColors[b.ring]} />
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
                                                {b.name}
                                            </text>
                                        </g>
                                    );
                                })
                            )}
                        </g>

                    );
                })}

                {/* Blips en el radar */}
                {blips.map((blip) => {
                    const { x, y } = blipPositions[blip.id];
                    const isActive = hoveredBlipId === blip.id;

                    // Ajuste de posición del texto para evitar colisiones
                    let labelX = 10;
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
                            onMouseEnter={() => setHoveredBlipId(blip.id)}
                            onMouseLeave={() => setHoveredBlipId(null)}
                            style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                        >
                            <circle
                                cx={0}
                                cy={0}
                                r={8}
                                fill={ringColors[blip.ring]}
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
                                {blip.name}
                            </text>
                        </g>
                    );
                })}

            </svg>
        </div>
    );
};

export default TechRadar;
