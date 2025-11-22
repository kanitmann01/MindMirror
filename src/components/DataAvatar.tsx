import React, { useMemo } from 'react';

interface DataAvatarProps {
    archetypeId?: string;
    archetypeColor: string;
    streak: number;
    openness?: number; // 0-100
    seed?: number;
    theme?: string; // 'neon', 'pastel', 'monochrome'
    size?: number;
    className?: string;
    shape?: 'triangle' | 'hexagon' | 'circle' | 'star';
    complexity?: 'low' | 'medium' | 'high';
    color?: string; // Explicit color override
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const DataAvatar: React.FC<DataAvatarProps> = ({ 
    archetypeId, 
    archetypeColor, 
    streak, 
    openness = 50, 
    seed = 12345, 
    theme = 'neon', 
    size = 120, 
    className,
    shape: propShape,
    complexity: propComplexity,
    color: propColor
}) => {
    const center = size / 2;
    const radius = size * 0.4; // Slightly smaller than container
    
    // Determine effective params
    const effectiveColor = propColor || archetypeColor;
    const effectiveShape = propShape || (() => {
        switch (archetypeId?.toLowerCase()) {
            case 'explorer': return 'triangle';
            case 'sentinel': return 'square'; // Map to square logic if needed, or just use hexagon
            case 'diplomat': return 'circle'; // Use circle logic
            case 'analyst': return 'hexagon';
            case 'creator': return 'star';
            default: return 'triangle';
        }
    })();
    const effectiveComplexity = propComplexity || (() => {
        if (openness < 30) return 'low';
        if (openness < 70) return 'medium';
        return 'high';
    })();

    // Memoize geometry generation
    const geometry = useMemo(() => {
        const rotationOffset = seededRandom(seed) * Math.PI * 2;
        
        let vertices: { x: number, y: number }[] = [];
        let pathD = ''; // For complex shapes like circle/star

        // Shape Generation
        if (effectiveShape === 'circle') {
             // Circle is special, handled in render but let's gen points for internal structure
             for (let i = 0; i < 12; i++) {
                const angle = rotationOffset + (i * 2 * Math.PI) / 12;
                vertices.push({
                    x: center + radius * Math.cos(angle),
                    y: center + radius * Math.sin(angle)
                });
            }
        } else {
            let numSides = 3;
            if (effectiveShape === 'triangle') numSides = 3;
            else if (effectiveShape === 'hexagon') numSides = 6;
            else if (effectiveShape === 'star') numSides = 10; // Star uses alternating radii
            else numSides = 4; // Square/Default

            for (let i = 0; i < numSides; i++) {
                const angle = rotationOffset + (i * 2 * Math.PI) / numSides;
                let r = radius;
                if (effectiveShape === 'star' && i % 2 !== 0) {
                    r = radius * 0.5; // Inner star points
                }
                vertices.push({
                    x: center + r * Math.cos(angle),
                    y: center + r * Math.sin(angle)
                });
            }
        }

        // Generate internal lines based on complexity
        const internalLines = [];
        let numLines = 0;
        if (effectiveComplexity === 'medium') numLines = 4;
        if (effectiveComplexity === 'high') numLines = 12;
        
        // Use complexity and seed to generate lines
        for (let i = 0; i < numLines; i++) {
            const idx1 = Math.floor(seededRandom(seed + i) * vertices.length);
            const idx2 = Math.floor(seededRandom(seed + i + 100) * vertices.length);
            if (idx1 !== idx2) {
                internalLines.push({
                    x1: vertices[idx1].x,
                    y1: vertices[idx1].y,
                    x2: vertices[idx2].x,
                    y2: vertices[idx2].y,
                    opacity: 0.3 + (seededRandom(seed + i + 200) * 0.4)
                });
            }
        }

        // Secondary shape (inner)
        const innerVertices = vertices.map(v => ({
            x: center + (v.x - center) * 0.6,
            y: center + (v.y - center) * 0.6
        }));

        return { vertices, internalLines, innerVertices };
    }, [effectiveShape, effectiveComplexity, seed, size, radius, center]);

    // Theme styles
    const styles = useMemo(() => {
        let strokeColor = effectiveColor;
        let fillColor = `${effectiveColor}33`; // 20% opacity default
        let strokeWidth = 2;
        let filter = 'none';

        if (theme === 'neon') {
            filter = `drop-shadow(0 0 5px ${effectiveColor})`;
            strokeWidth = 2;
            fillColor = 'none'; // Wireframe style
        } else if (theme === 'pastel') {
            strokeColor = '#ffffff';
            fillColor = effectiveColor;
            strokeWidth = 0;
        } else if (theme === 'monochrome') {
            strokeColor = '#ffffff';
            fillColor = '#000000';
            filter = 'grayscale(100%)';
        }

        // Adjust for complexity
        if (effectiveComplexity === 'low') {
             // Solid feel
             if (theme === 'neon') fillColor = `${effectiveColor}11`; // Slight fill
        } else if (effectiveComplexity === 'high') {
             // More intricate
        }

        return { strokeColor, fillColor, strokeWidth, filter };
    }, [theme, effectiveColor, effectiveComplexity]);

    // Streak Ring Logic
    let ringColor = 'none';
    let ringWidth = 0;
    let ringGlow = 'none';

    if (streak > 30) {
        ringColor = '#FFD700'; // Gold
        ringWidth = 4;
        ringGlow = '0 0 10px #FFD700';
    } else if (streak > 7) {
        ringColor = '#C0C0C0'; // Silver
        ringWidth = 3;
        ringGlow = '0 0 5px #C0C0C0';
    } else if (streak > 3) {
        ringColor = '#CD7F32'; // Bronze
        ringWidth = 2;
    }

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Defs for gradients/filters if needed */}
                <defs>
                    <pattern id={`dots-${seed}`} width="4" height="4" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill={effectiveColor} opacity="0.3" />
                    </pattern>
                </defs>

                {/* Outer Ring (Streak) */}
                {streak > 3 && (
                     <circle
                        cx={center}
                        cy={center}
                        r={(size / 2) - 4}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth={ringWidth}
                        strokeDasharray={streak > 30 ? "none" : "10 5"} // Dashed for lower levels
                        style={{ filter: ringGlow !== 'none' ? `drop-shadow(${ringGlow})` : 'none' }}
                        className="animate-spin-slow"
                    />
                )}

                {/* Main Shape Group */}
                <g style={{ filter: styles.filter }} className="transition-all duration-500">
                    {/* Base Shape */}
                    {effectiveShape === 'circle' ? (
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill={styles.fillColor}
                            stroke={styles.strokeColor}
                            strokeWidth={styles.strokeWidth}
                            className="opacity-80"
                        />
                    ) : (
                        <polygon
                            points={geometry.vertices.map(v => `${v.x},${v.y}`).join(' ')}
                            fill={styles.fillColor}
                            stroke={styles.strokeColor}
                            strokeWidth={styles.strokeWidth}
                            className="opacity-80"
                        />
                    )}

                    {/* High Complexity Pattern Overlay */}
                    {effectiveComplexity === 'high' && effectiveShape !== 'circle' && (
                         <polygon
                            points={geometry.vertices.map(v => `${v.x},${v.y}`).join(' ')}
                            fill={`url(#dots-${seed})`}
                            className="opacity-50"
                        />
                    )}

                    {/* Inner Shape (Medium/High) */}
                    {(effectiveComplexity === 'medium' || effectiveComplexity === 'high') && (
                        effectiveShape === 'circle' ? (
                             <circle
                                cx={center}
                                cy={center}
                                r={radius * 0.6}
                                fill="none"
                                stroke={styles.strokeColor}
                                strokeWidth={1}
                                className="opacity-50"
                            />
                        ) : (
                            <polygon
                                points={geometry.innerVertices.map(v => `${v.x},${v.y}`).join(' ')}
                                fill="none"
                                stroke={styles.strokeColor}
                                strokeWidth={1}
                                className="opacity-50"
                            />
                        )
                    )}

                    {/* Internal Complexity Lines */}
                    {geometry.internalLines.map((line, i) => (
                        <line
                            key={i}
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                            stroke={styles.strokeColor}
                            strokeWidth={1}
                            opacity={line.opacity}
                        />
                    ))}
                    
                    {/* Center Node */}
                     <circle
                        cx={center}
                        cy={center}
                        r={size * 0.05}
                        fill={styles.strokeColor}
                        className="animate-pulse"
                    />
                </g>
            </svg>
        </div>
    );
};

export default DataAvatar;
