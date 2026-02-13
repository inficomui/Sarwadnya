import React, { useEffect, useRef } from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle, Animated } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    variant?: 'full' | 'icon';
    style?: ViewStyle;
    animated?: boolean;
}

const LOGO_SIZES = {
    small: 60,
    medium: 100,
    large: 150,
    xlarge: 200,
};

export default function Logo({ size = 'medium', variant = 'full', style, animated = false }: LogoProps) {
    const logoSize = LOGO_SIZES[size];
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    // For now using the full logo, you can add icon variant later
    const logoSource = require('../../assets/images/logo.png');

    useEffect(() => {
        if (animated) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 10,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(1);
            scaleAnim.setValue(1);
        }
    }, [animated]);

    const animatedStyle = animated ? {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
    } : {};

    return (
        <Animated.View style={[styles.container, style, animatedStyle]}>
            <Image
                source={logoSource}
                style={[
                    styles.logo,
                    {
                        width: variant === 'icon' ? logoSize : logoSize * 2.5,
                        height: logoSize,
                    },
                ]}
                resizeMode="contain"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        // Base styles
    },
});
