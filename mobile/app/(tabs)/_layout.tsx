import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { FontSize, Shadow, ThemeColors } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const TAB_BAR_WIDTH = width - 40;

// Mapping for cleaner labels and icons
const TAB_CONFIG: Record<string, { label: string; activeIcon: any; inactiveIcon: any }> = {
    index: { label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    investments: { label: 'Invest', activeIcon: 'trending-up', inactiveIcon: 'trending-up-outline' },
    wallet: { label: 'Wallet', activeIcon: 'wallet', inactiveIcon: 'wallet-outline' },
    profile: { label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
};

export default function TabLayout() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const isWalletActive = user?.is_wallet_active ?? false;
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    return (
        <Tabs
            tabBar={props => <CustomTabBar {...props} styles={styles} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="investments"
                options={{
                    title: 'Investments',
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    href: isWalletActive ? '/(tabs)/wallet' : null,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                }}
            />
        </Tabs>
    );
}

function CustomTabBar({ state, descriptors, navigation, styles }: any) {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];

                    // Skip hidden tabs
                    if (options.href === null) return null;

                    const isFocused = state.index === index;
                    const config = TAB_CONFIG[route.name] || {
                        label: options.title || route.name,
                        activeIcon: 'ellipse',
                        inactiveIcon: 'ellipse-outline'
                    };

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            isFocused={isFocused}
                            label={config.label}
                            activeIcon={config.activeIcon}
                            inactiveIcon={config.inactiveIcon}
                            onPress={onPress}
                            styles={styles}
                            colors={colors}
                            isDark={isDark}
                        />
                    );
                })}
            </View>
        </View>
    );
}

interface TabItemProps {
    isFocused: boolean;
    label: string;
    activeIcon: string;
    inactiveIcon: string;
    onPress: () => void;
    styles: any;
    colors: ThemeColors;
    isDark: boolean;
}

function TabItem({ isFocused, label, activeIcon, inactiveIcon, onPress, styles, colors, isDark }: TabItemProps) {
    const animation = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        animation.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    }, [isFocused]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animation.value,
            [0, 1],
            ['transparent', isDark ? colors.background.primary : colors.background.white]
        );

        const paddingHorizontal = interpolate(
            animation.value,
            [0, 1],
            [10, 16] // Adjusted for better balance
        );

        return {
            backgroundColor,
            paddingHorizontal,
        };
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
        const opacity = animation.value;
        const maxWidth = interpolate(animation.value, [0, 1], [0, 100]);
        const marginLeft = interpolate(animation.value, [0, 1], [0, 6]);

        return {
            opacity,
            maxWidth,
            marginLeft,
        };
    });

    const iconColor = isFocused
        ? colors.primary.start
        : (isDark ? colors.text.muted : 'rgba(255,255,255,0.7)');

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItemContainer}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
        >
            <Animated.View style={[styles.tabItemPill, animatedContainerStyle]}>
                <Ionicons
                    name={(isFocused ? activeIcon : inactiveIcon) as any}
                    size={22}
                    color={iconColor}
                />

                <Animated.Text
                    style={[styles.tabLabel, animatedLabelStyle, { color: colors.primary.start }]}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: isDark ? colors.background.secondary : colors.primary.start,
        borderRadius: 40,
        paddingVertical: 10,
        paddingHorizontal: 12,
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-around', // Changed to around for better spacing
        width: TAB_BAR_WIDTH,
        ...Shadow.xlarge,
        shadowColor: isDark ? '#000' : colors.primary.start,
        shadowOpacity: isDark ? 0.3 : 0.4,
        elevation: 10,
    },
    tabItemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabItemPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 24,
    },
    tabLabel: {
        fontSize: FontSize.sm,
        fontWeight: '700',
    },
});
