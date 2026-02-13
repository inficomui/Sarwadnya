import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { View } from 'react-native';

interface AnimatedFingerprintProps {
    size?: number;
    color?: string;
}

export const AnimatedFingerprint: React.FC<AnimatedFingerprintProps> = ({
    size = 40,
    color = "#4A90E2"
}) => {
    return (
        <View style={{ width: size + 20, height: size + 20, justifyContent: 'center', alignItems: 'center' }}>
            {/* Pulsing Ring */}
            <MotiView
                from={{ opacity: 0.5, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{
                    type: 'timing',
                    duration: 1500,
                    loop: true,
                    repeatReverse: false
                }}
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 2,
                    borderColor: color,
                }}
            />

            {/* Fingerprint Icon */}
            <Ionicons name="finger-print" size={size} color={color} />
        </View>
    );
};
