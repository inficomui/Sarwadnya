import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, PanResponder, StyleSheet, Vibration, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CONTAINER_SIZE = width * 0.85;
const DOT_RADIUS = 8; // Slightly smaller for a more refined look
const OUTER_GLOW_RADIUS = 24;

interface PatternLockProps {
    onPatternComplete: (pattern: number[]) => void;
    error?: boolean;
    dotColor?: string;
    activeDotColor?: string;
    lineColor?: string;
}

export const PatternLock: React.FC<PatternLockProps> = ({
    onPatternComplete,
    error,
    dotColor = "rgba(255,255,255,0.15)",
    activeDotColor = "#4A90E2",
    lineColor = "#4A90E2"
}) => {
    const [pattern, setPattern] = useState<number[]>([]);
    const [activeLine, setActiveLine] = useState<{ x: number; y: number } | null>(null);
    const [dots, setDots] = useState<{ x: number; y: number; index: number }[]>([]);

    const patternRef = useRef<number[]>([]);
    const dotsRef = useRef<{ x: number; y: number; index: number }[]>([]);

    useEffect(() => {
        const newDots = [];
        const step = CONTAINER_SIZE / 3;
        const offset = step / 2;

        for (let i = 0; i < 9; i++) {
            newDots.push({
                x: (i % 3) * step + offset,
                y: Math.floor(i / 3) * step + offset,
                index: i,
            });
        }
        setDots(newDots);
        dotsRef.current = newDots;
    }, []);

    const getDotIndex = (x: number, y: number) => {
        for (let dot of dotsRef.current) {
            const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
            if (distance < 40) return dot.index; // Generous hit area for better UX
        }
        return -1;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const index = getDotIndex(locationX, locationY);
                patternRef.current = index !== -1 ? [index] : [];
                setPattern(patternRef.current);
                if (index !== -1) Vibration.vibrate(10);
                setActiveLine({ x: locationX, y: locationY });
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setActiveLine({ x: locationX, y: locationY });
                const index = getDotIndex(locationX, locationY);

                if (index !== -1) {
                    const current = patternRef.current;
                    if (!current.includes(index)) {
                        const newPattern = [...current, index];
                        patternRef.current = newPattern;
                        setPattern(newPattern);
                        Vibration.vibrate(15);
                    }
                }
            },
            onPanResponderRelease: () => {
                setActiveLine(null);
                if (patternRef.current.length > 0) {
                    onPatternComplete(patternRef.current);
                }
            },
        })
    ).current;

    const currentLineColor = error ? "#FF4444" : lineColor;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <Svg width={CONTAINER_SIZE} height={CONTAINER_SIZE} pointerEvents="none">
                {/* Connecting Lines */}
                {pattern.map((dotIdx, i) => {
                    if (i === 0) return null;
                    const prev = dots[pattern[i - 1]];
                    const curr = dots[dotIdx];
                    return (
                        <Line
                            key={`l-${i}`}
                            x1={prev.x} y1={prev.y}
                            x2={curr.x} y2={curr.y}
                            stroke={currentLineColor}
                            strokeWidth="5"
                            strokeLinecap="round"
                            opacity={0.8}
                        />
                    );
                })}

                {/* Tracking Line */}
                {activeLine && pattern.length > 0 && (
                    <Line
                        x1={dots[pattern[pattern.length - 1]].x}
                        y1={dots[pattern[pattern.length - 1]].y}
                        x2={activeLine.x}
                        y2={activeLine.y}
                        stroke={currentLineColor}
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                )}

                {/* Dots */}
                {dots.map((dot) => {
                    const isSelected = pattern.includes(dot.index);
                    const activeColor = error ? "#FF4444" : activeDotColor;

                    return (
                        <React.Fragment key={dot.index}>
                            {/* Outer Glow */}
                            {isSelected && (
                                <Circle
                                    cx={dot.x} cy={dot.y}
                                    r={OUTER_GLOW_RADIUS}
                                    fill={activeColor}
                                    opacity={0.15}
                                />
                            )}
                            {/* Static Dot */}
                            <Circle
                                cx={dot.x} cy={dot.y}
                                r={isSelected ? DOT_RADIUS + 2 : DOT_RADIUS}
                                fill={isSelected ? activeColor : dotColor}
                            />
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)', // Very subtle plate look
        borderRadius: 24,
        padding: 10,
    }
});
















// import React, { useEffect, useRef, useState } from 'react';
// import { Dimensions, PanResponder, StyleSheet, Vibration, View } from 'react-native';
// import Svg, { Circle, Line } from 'react-native-svg';

// const { width } = Dimensions.get('window');
// const CONTAINER_SIZE = width * 0.8;
// const DOT_SIZE = 60; // Hit slop reference
// const DOT_RADIUS = 10;

// interface PatternLockProps {
//     onPatternComplete: (pattern: number[]) => void;
//     error?: boolean;
// }

// export const PatternLock: React.FC<PatternLockProps & { dotColor?: string, activeDotColor?: string, lineColor?: string }> = ({
//     onPatternComplete,
//     error,
//     dotColor = "rgba(255,255,255,0.3)",
//     activeDotColor = "#4A90E2",
//     lineColor = "#4A90E2"
// }) => {
//     // State for rendering
//     const [pattern, setPattern] = useState<number[]>([]);
//     const [activeLine, setActiveLine] = useState<{ x: number; y: number } | null>(null);
//     const [dots, setDots] = useState<{ x: number; y: number; index: number }[]>([]);

//     // Refs for Gesture Logic (Source of Truth to avoid stale closures in PanResponder)
//     const patternRef = useRef<number[]>([]);
//     const dotsRef = useRef<{ x: number; y: number; index: number }[]>([]);

//     // Initialize dots on mount
//     useEffect(() => {
//         const newDots = [];
//         const step = CONTAINER_SIZE / 3;
//         const offset = step / 2;

//         for (let i = 0; i < 9; i++) {
//             const row = Math.floor(i / 3);
//             const col = i % 3;
//             newDots.push({
//                 x: col * step + offset,
//                 y: row * step + offset,
//                 index: i,
//             });
//         }

//         setDots(newDots);
//         dotsRef.current = newDots;
//     }, []);

//     const getDotIndex = (x: number, y: number) => {
//         // Use Ref to ensure we always access the initialized dots inside PanResponder
//         for (let dot of dotsRef.current) {
//             const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
//             if (distance < 35) { // 35px radius (70px diameter hit area)
//                 return dot.index;
//             }
//         }
//         return -1;
//     };

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => true,
//             onMoveShouldSetPanResponder: () => true,

//             onPanResponderGrant: (evt) => {
//                 const { locationX, locationY } = evt.nativeEvent;
//                 const index = getDotIndex(locationX, locationY);

//                 // Reset pattern
//                 if (index !== -1) {
//                     const newPattern = [index];
//                     patternRef.current = newPattern;
//                     setPattern(newPattern);
//                     Vibration.vibrate(20);
//                 } else {
//                     patternRef.current = [];
//                     setPattern([]);
//                 }

//                 setActiveLine({ x: locationX, y: locationY });
//             },

//             onPanResponderMove: (evt) => {
//                 const { locationX, locationY } = evt.nativeEvent;
//                 setActiveLine({ x: locationX, y: locationY });

//                 const index = getDotIndex(locationX, locationY);
//                 if (index !== -1) {
//                     const currentPattern = patternRef.current;

//                     // Prevent adding the same dot if it's the last one added
//                     if (currentPattern.length > 0 && currentPattern[currentPattern.length - 1] === index) {
//                         return;
//                     }

//                     // Add new dot if not already in pattern
//                     if (!currentPattern.includes(index)) {
//                         Vibration.vibrate(20);
//                         const newPattern = [...currentPattern, index];
//                         patternRef.current = newPattern; // Update Source of Truth
//                         setPattern(newPattern); // Update Render
//                     }
//                 }
//             },

//             onPanResponderRelease: () => {
//                 setActiveLine(null);
//                 const finalPattern = patternRef.current;
//                 if (finalPattern.length > 0) {
//                     onPatternComplete(finalPattern);
//                 }
//             },
//         })
//     ).current;

//     // Render lines connecting dots
//     const renderLines = () => {
//         if (!dots.length) return null;

//         const lines = [];
//         const strokeColor = error ? "#FF4444" : lineColor;

//         for (let i = 0; i < pattern.length - 1; i++) {
//             const start = dots[pattern[i]];
//             const end = dots[pattern[i + 1]];
//             lines.push(
//                 <Line
//                     key={`line-${i}`}
//                     x1={start.x}
//                     y1={start.y}
//                     x2={end.x}
//                     y2={end.y}
//                     stroke={strokeColor}
//                     strokeWidth="4"
//                     strokeLinecap="round"
//                 />
//             );
//         }

//         // Active line following finger
//         if (activeLine && pattern.length > 0) {
//             const start = dots[pattern[pattern.length - 1]];
//             lines.push(
//                 <Line
//                     key="active-line"
//                     x1={start.x}
//                     y1={start.y}
//                     x2={activeLine.x}
//                     y2={activeLine.y}
//                     stroke={strokeColor}
//                     strokeWidth="4"
//                     strokeLinecap="round"
//                 />
//             );
//         }
//         return lines;
//     };

//     return (
//         <View
//             style={styles.container}
//             {...panResponder.panHandlers}
//         >
//             <Svg width={CONTAINER_SIZE} height={CONTAINER_SIZE} style={styles.svg} pointerEvents="none">
//                 {renderLines()}
//                 {dots.map((dot) => {
//                     const isSelected = pattern.includes(dot.index);
//                     const fill = isSelected ? (error ? "#FF4444" : activeDotColor) : dotColor;
//                     const stroke = isSelected ? (error ? "#FF4444" : activeDotColor) : "transparent";

//                     return (
//                         <Circle
//                             key={dot.index}
//                             cx={dot.x}
//                             cy={dot.y}
//                             r={DOT_RADIUS}
//                             fill={fill}
//                             stroke={stroke}
//                             strokeWidth="2"
//                         />
//                     );
//                 })}
//                 {/* Render outer circles (glow effect) for selected dots */}
//                 {dots.map((dot) => {
//                     if (pattern.includes(dot.index)) {
//                         return (
//                             <Circle
//                                 key={`outer-${dot.index}`}
//                                 cx={dot.x}
//                                 cy={dot.y}
//                                 r={DOT_RADIUS * 2.5}
//                                 fill={error ? "rgba(255,68,68,0.2)" : (activeDotColor === "#4A90E2" ? "rgba(74,144,226,0.2)" : `${activeDotColor}33`)}
//                             />
//                         );
//                     }
//                     return null;
//                 })}
//             </Svg>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         width: CONTAINER_SIZE,
//         height: CONTAINER_SIZE,
//         alignSelf: 'center',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginVertical: 40,
//         backgroundColor: 'transparent', // Explicitly set transparent background for touch handling
//     },
//     svg: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//     }
// });
