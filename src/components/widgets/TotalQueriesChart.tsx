import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ChartDataPoint } from '../../data/dashboardData';

interface TotalQueriesChartProps {
    data: ChartDataPoint[];
}

export function TotalQueriesChart({ data }: TotalQueriesChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: string } | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height: Math.min(height, 250) });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const padding = { top: 40, right: 20, bottom: 40, left: 50 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const valueRange = maxValue - minValue || 1;

    const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

    // Create bezier curve path
    const createPath = () => {
        if (data.length < 2) return '';

        let path = `M ${getX(0)} ${getY(data[0].value)}`;

        for (let i = 0; i < data.length - 1; i++) {
            const x0 = getX(i);
            const y0 = getY(data[i].value);
            const x1 = getX(i + 1);
            const y1 = getY(data[i + 1].value);

            const cpx = (x0 + x1) / 2;
            path += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
        }

        return path;
    };

    // Create gradient area path
    const createAreaPath = () => {
        const linePath = createPath();
        if (!linePath) return '';

        return `${linePath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;
    };

    const yAxisTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minValue + t * valueRange);

    return (
        <div className="card p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('widgets.totalQueries')}</h3>
            <div ref={containerRef} className="relative h-64 w-full overflow-hidden">
                {dimensions.width > 0 && (
                    <svg
                        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                        className="h-full w-full"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Y-axis grid lines */}
                        {yAxisTicks.map((tick, i) => (
                            <g key={i}>
                                <line
                                    x1={padding.left}
                                    y1={getY(tick)}
                                    x2={dimensions.width - padding.right}
                                    y2={getY(tick)}
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                    strokeDasharray="4"
                                    className="text-neutral-400"
                                />
                                <text
                                    x={padding.left - 10}
                                    y={getY(tick)}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    className="fill-neutral-500 text-xs dark:fill-neutral-400"
                                >
                                    {(tick / 1000).toFixed(0)}k
                                </text>
                            </g>
                        ))}

                        {/* X-axis labels */}
                        {data.map((d, i) => (
                            <text
                                key={i}
                                x={getX(i)}
                                y={dimensions.height - 10}
                                textAnchor="middle"
                                className="fill-neutral-500 text-xs dark:fill-neutral-400"
                            >
                                {d.date}
                            </text>
                        ))}

                        {/* Area fill */}
                        <path d={createAreaPath()} fill="url(#areaGradient)" />

                        {/* Line */}
                        <path
                            d={createPath()}
                            fill="none"
                            stroke="rgb(249, 115, 22)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {data.map((d, i) => (
                            <circle
                                key={i}
                                cx={getX(i)}
                                cy={getY(d.value)}
                                r="5"
                                fill="white"
                                stroke="rgb(249, 115, 22)"
                                strokeWidth="3"
                                className="cursor-pointer transition-all hover:r-7"
                                onMouseEnter={() => setHoveredPoint({ x: getX(i), y: getY(d.value), value: d.value, date: d.date })}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        ))}
                    </svg>
                )}

                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="pointer-events-none absolute z-10 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white shadow-lg dark:bg-neutral-700"
                        style={{
                            left: hoveredPoint.x,
                            top: hoveredPoint.y - 50,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="font-semibold">{hoveredPoint.value.toLocaleString()}</div>
                        <div className="text-neutral-400">{hoveredPoint.date}</div>
                        {/* Speech bubble arrow */}
                        <div
                            className="absolute left-1/2 h-0 w-0 -translate-x-1/2"
                            style={{
                                top: '100%',
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: '6px solid rgb(23, 23, 23)',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default TotalQueriesChart;
