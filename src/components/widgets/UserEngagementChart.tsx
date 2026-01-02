import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { UserSegment } from '../../data/dashboardData';

interface UserEngagementChartProps {
    data: UserSegment[];
}

// Map segment names to translation keys
const segmentTranslationKeys: Record<string, string> = {
    'New Users': 'userSegments.newUsers',
    'Old Users': 'userSegments.oldUsers',
};

export function UserEngagementChart({ data }: UserEngagementChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const { t } = useLanguage();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                // Use the container width to determine size, capping at a reasonable max
                const size = Math.min(width, 280);
                setDimensions({ width: size, height: size });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) / 2 - 20;
    const strokeWidth = 24;

    const createArc = (startAngle: number, endAngle: number, r: number) => {
        const start = {
            x: centerX + r * Math.cos(startAngle),
            y: centerY + r * Math.sin(startAngle),
        };
        const end = {
            x: centerX + r * Math.cos(endAngle),
            y: centerY + r * Math.sin(endAngle),
        };
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    };

    let currentAngle = -Math.PI / 2; // Start from top
    const segments = data.map((segment) => {
        const angle = (segment.value / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        return {
            ...segment,
            path: createArc(startAngle, endAngle - 0.02, radius - strokeWidth / 2),
        };
    });

    const colorMap: Record<string, string> = {
        'accent-yellow': '#eab308',
        'accent-blue': '#3b82f6',
    };

    return (
        <div className="card p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('widgets.userEngagement')}</h3>
            <div ref={containerRef} className="relative mx-auto flex items-center justify-center" style={{ minHeight: '200px' }}>
                {dimensions.width > 0 && (
                    <svg
                        width={dimensions.width}
                        height={dimensions.height}
                        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                        className="overflow-visible"
                    >
                        {/* Background circle */}
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius - strokeWidth / 2}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            strokeOpacity="0.1"
                            className="text-neutral-300 dark:text-neutral-600"
                        />

                        {/* Segments */}
                        {segments.map((segment, i) => (
                            <path
                                key={i}
                                d={segment.path}
                                fill="none"
                                stroke={colorMap[segment.color] || segment.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />
                        ))}
                    </svg>
                )}

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6">
                {data.map((segment, i) => {
                    const translatedName = segmentTranslationKeys[segment.name]
                        ? t(segmentTranslationKeys[segment.name])
                        : segment.name;

                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: colorMap[segment.color] || segment.color }}
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {translatedName} ({segment.value}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default UserEngagementChart;
