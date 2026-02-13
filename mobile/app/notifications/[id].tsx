import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { useDeleteNotificationMutation, useMarkAsReadMutation } from '../../redux/apies/notificationApi';

const { width } = Dimensions.get('window');

export default function NotificationDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, title, body, date, type, read_at } = params;
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

    const [isRead, setIsRead] = useState(!!read_at);
    const [menuVisible, setMenuVisible] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 30,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true
            })
        ]).start();

        // Icon Rotation Loop (Subtle)
        Animated.loop(
            Animated.sequence([
                Animated.timing(iconRotate, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(iconRotate, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();

        if (id && !read_at && !isRead) {
            markAsRead(id as string).unwrap().then(() => setIsRead(true)).catch(console.error);
        }
    }, []);

    const handleDelete = () => {
        setMenuVisible(false);
        Alert.alert(
            "Delete Notification",
            "Are you sure you want to remove this notification?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteNotification(id as string).unwrap();
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete notification");
                        }
                    }
                }
            ]
        );
    };

    const getTheme = (titleStr: string = '') => {
        const lower = titleStr.toLowerCase();
        if (lower.includes('success')) return {
            icon: 'checkmark-circle',
            color: colors.status.success,
            gradient: isDark ? ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.3)'] : ['#D1FAE5', '#A7F3D0'],
            light: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5'
        };
        if (lower.includes('error') || lower.includes('fail')) return {
            icon: 'close-circle',
            color: colors.status.error,
            gradient: isDark ? ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.3)'] : ['#FEE2E2', '#FECACA'],
            light: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2'
        };
        if (lower.includes('warning')) return {
            icon: 'alert-circle',
            color: colors.status.warning,
            gradient: isDark ? ['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.3)'] : ['#FEF3C7', '#FDE68A'],
            light: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB'
        };
        return {
            icon: 'notifications',
            color: colors.primary.start,
            gradient: isDark ? ['rgba(102, 126, 234, 0.2)', 'rgba(59, 130, 246, 0.3)'] : ['#E0E7FF', '#C7D2FE'],
            light: isDark ? 'rgba(102, 126, 234, 0.1)' : '#EEF2FF'
        };
    };

    const theme = getTheme(title as string);

    const spin = iconRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg']
    });

    return (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.container}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

                {/* Background Decor */}
                <View style={[styles.ambientCircle, { backgroundColor: theme.color + '10', top: -80, right: -80 }]} />
                <View style={[styles.ambientCircleSmall, { backgroundColor: theme.color + '08', bottom: 100, left: -50 }]} />

                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Message Details</Text>

                        <View style={{ zIndex: 20 }}>
                            <TouchableOpacity
                                onPress={() => setMenuVisible(!menuVisible)}
                                style={styles.actionButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.primary} />
                            </TouchableOpacity>

                            {/* Dropdown Menu */}
                            {menuVisible && (
                                <Animated.View style={styles.dropdownMenu}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={handleDelete}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                                        <Text style={styles.menuText}>Delete</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View style={[
                            styles.card,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                            }
                        ]}>

                            {/* Header Status Bar */}
                            <View style={styles.cardHeaderRow}>
                                <View style={[styles.statusBadge, { backgroundColor: isRead ? (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9') : theme.light }]}>
                                    <View style={[styles.statusDot, { backgroundColor: isRead ? colors.text.muted : theme.color }]} />
                                    <Text style={[styles.statusText, { color: isRead ? colors.text.secondary : theme.color }]}>
                                        {isRead ? 'Read' : 'New Message'}
                                    </Text>
                                </View>
                                <Text style={styles.dateLabel}>
                                    {new Date(date as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </View>

                            <View style={styles.cardContent}>
                                {/* Animated Icon */}
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <LinearGradient colors={theme.gradient as any} style={styles.iconCircle}>
                                        <Ionicons name={theme.icon as any} size={42} color={theme.color} />
                                    </LinearGradient>
                                </Animated.View>

                                <Text style={styles.titleText}>{title}</Text>

                                <View style={styles.divider} />

                                <Text style={styles.bodyText}>{body}</Text>
                            </View>

                            {/* Footer Info */}
                            <View style={styles.cardFooter}>
                                <Ionicons name="time-outline" size={14} color={colors.text.muted} />
                                <Text style={styles.footerTime}>
                                    Received at {new Date(date as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    ambientCircle: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    ambientCircleSmall: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        zIndex: 100,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: colors.text.primary,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        padding: 8,
        minWidth: 150,
        ...Shadow.medium,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 1000,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: BorderRadius.md,
    },
    menuText: {
        marginLeft: 10,
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.status.error,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingTop: Spacing.md,
        zIndex: 1,
    },
    card: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xxxl,
        ...Shadow.medium,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        padding: 6,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardContent: {
        padding: 24,
        alignItems: 'center',
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 4,
        borderColor: colors.background.card,
    },
    dateLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.muted,
    },
    titleText: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 10,
    },
    divider: {
        height: 2,
        width: 40,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    bodyText: {
        fontSize: 16,
        color: colors.text.secondary,
        lineHeight: 28,
        textAlign: 'center',
        paddingHorizontal: 10,
        fontWeight: '400',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
        borderRadius: BorderRadius.xxl,
        marginTop: 10,
    },
    footerTime: {
        fontSize: 13,
        color: colors.text.muted,
        marginLeft: 6,
        fontWeight: '500',
    },
});
