import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/common/Logo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate to main app after 3 seconds
        const timer = setTimeout(async () => {
            const user = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');

            if (user && token) {
                router.replace('/(tabs)');
            } else {
                router.replace('/auth/login');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Animated circles in background */}
                <Animated.View
                    style={[
                        styles.circle,
                        styles.circle1,
                        {
                            transform: [{ rotate: spin }],
                            opacity: fadeAnim,
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.circle,
                        styles.circle2,
                        {
                            transform: [{ rotate: spin }],
                            opacity: fadeAnim,
                        },
                    ]}
                />

                {/* Main content */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Logo size="xlarge" variant="full" animated={true} />
                    </View>

                    {/* App name */}
                    <Text style={styles.title}>Shree Sarwadnya</Text>
                    <Text style={styles.subtitle}>All in one Solutions</Text>

                    {/* Tagline */}
                    <Animated.View
                        style={[
                            styles.taglineContainer,
                            {
                                opacity: fadeAnim,
                            },
                        ]}
                    >
                        <Text style={styles.tagline}>Growth. Trust. Success.</Text>
                    </Animated.View>
                </Animated.View>

                {/* Loading indicator */}
                <Animated.View
                    style={[
                        styles.loadingContainer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <View style={styles.loadingBar}>
                        <Animated.View
                            style={[
                                styles.loadingProgress,
                                {
                                    transform: [{ scaleX: scaleAnim }],
                                },
                            ]}
                        />
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle1: {
        width: width * 1.5,
        height: width * 1.5,
        top: -width * 0.5,
        right: -width * 0.3,
    },
    circle2: {
        width: width * 1.2,
        height: width * 1.2,
        bottom: -width * 0.4,
        left: -width * 0.2,
    },
    content: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoContainer: {
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#ffffff',
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 0.5,
    },
    taglineContainer: {
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    tagline: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '600',
        letterSpacing: 1,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 80,
        width: width * 0.6,
    },
    loadingBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingProgress: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
});
