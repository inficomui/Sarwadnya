import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadow, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { Notification } from '../lib/types';
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from '../redux/apies/notificationApi';

const { width } = Dimensions.get('window');

const AnimatedNotificationItem = ({ item, index, onPress }: { item: Notification; index: number; onPress: () => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const isRead = !!item.read_at;
    const { colors, isDark } = useTheme();

    const styles = useMemo(() => createItemStyles(colors), [colors]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 80, // Staggered delay for cascade effect
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                delay: index * 80,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const getIcon = (title: string = '') => {
        const lower = title.toLowerCase();
        if (lower.includes('success')) return { name: 'checkmark-circle', color: colors.status.success, bg: colors.iconBg.green, border: isDark ? colors.status.success + '20' : '#D1FAE5' };
        if (lower.includes('error') || lower.includes('fail')) return { name: 'alert-circle', color: colors.status.error, bg: colors.iconBg.red, border: isDark ? colors.status.error + '20' : '#FEE2E2' };
        if (lower.includes('warning') || lower.includes('alert')) return { name: 'warning', color: colors.status.warning, bg: colors.iconBg.yellow, border: isDark ? colors.status.warning + '20' : '#FEF3C7' };
        return { name: 'notifications', color: colors.primary.start, bg: colors.iconBg.blue, border: isDark ? colors.primary.start + '20' : '#E0E7FF' };
    };

    const icon = getIcon(item.data?.title);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
        >
            <TouchableOpacity
                style={[styles.notificationCard, !isRead && styles.unreadCard]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {/* Unread Indicator Bar */}
                {!isRead && (
                    <View style={styles.unreadBar} />
                )}

                <View style={[styles.iconContainer, { backgroundColor: icon.bg, borderColor: icon.border }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                </View>

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text
                            style={[
                                styles.title,
                                !isRead && { color: colors.text.primary, fontWeight: '700' }
                            ]}
                            numberOfLines={1}
                        >
                            {item.data?.title || 'Notification'}
                        </Text>
                        <Text style={styles.time}>
                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>

                    <Text style={[styles.message, !isRead && { color: colors.text.secondary }]} numberOfLines={2}>
                        {item.data?.body || ''}
                    </Text>
                </View>

                {!isRead && (
                    <View style={styles.newDot} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const { colors, isDark } = useTheme();

    const styles = useMemo(() => createScreenStyles(colors), [colors]);

    const { data: notificationData, isLoading, isFetching, refetch } = useGetNotificationsQuery({
        page: page,
        per_page: 20
    });

    const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();

    const notifications = notificationData?.data?.data || [];
    const lastPage = notificationData?.data?.last_page || 1;

    // Pulse animation for empty state
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (notifications.length === 0 && !isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
                ])
            ).start();
        }
    }, [notifications.length, isLoading]);

    const onRefresh = useCallback(() => {
        setPage(1);
        refetch();
    }, [refetch]);

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const loadMore = () => {
        if (page < lastPage && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyIconBg, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                    colors={[colors.primary.start + '15', colors.primary.end + '05']}
                    style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="notifications-off" size={48} color={colors.primary.start} />
            </Animated.View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up! Check back later for updates.</Text>
        </View>
    );

    const renderFooter = () => (
        isFetching && page > 1 ? (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary.start} />
            </View>
        ) : <View style={{ height: 100 }} /> // Spacer for bottom
    );

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={isDark ? [colors.background.primary, colors.background.primary] : ['#fff', '#F8FAFC', '#F1F5F9']}
                style={StyleSheet.absoluteFillObject}
            />
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Notifications</Text>

                        {notifications.length > 0 ? (
                            <TouchableOpacity
                                onPress={handleMarkAllAsRead}
                                style={styles.markAllButton}
                                disabled={isMarkingAllRead}
                            >
                                {isMarkingAllRead ? (
                                    <ActivityIndicator size="small" color={colors.primary.start} />
                                ) : (
                                    <Ionicons name="checkmark-done-circle-outline" size={24} color={colors.primary.start} />
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 44 }} />
                        )}
                    </View>
                </View>

                {isLoading && page === 1 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.start} />
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={({ item, index }) => (
                            <AnimatedNotificationItem
                                item={item}
                                index={index}
                                onPress={() => {
                                    router.push({
                                        pathname: '/notifications/[id]',
                                        params: {
                                            id: item.id,
                                            title: item.data?.title,
                                            body: item.data?.body,
                                            date: item.created_at,
                                            type: item.type,
                                            read_at: item.read_at || ''
                                        }
                                    });
                                }}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmpty}
                        ListFooterComponent={renderFooter}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching && page === 1}
                                onRefresh={onRefresh}
                                colors={[colors.primary.start]}
                                tintColor={colors.primary.start}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const createItemStyles = (colors: ThemeColors) => StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: colors.shadow.color,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: colors.shadow.opacity,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    unreadCard: {
        backgroundColor: colors.background.card,
        borderColor: colors.primary.start + '40', // Slight highlight for unread
        shadowOpacity: colors.shadow.opacity + 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    unreadBar: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 4,
        backgroundColor: colors.primary.start,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        flex: 1,
        marginRight: 8,
        opacity: 0.8,
    },
    message: {
        fontSize: 13,
        color: colors.text.muted,
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '500',
    },
    newDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary.start,
        marginLeft: 10,
    },
});

const createScreenStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontSize: 20,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: 0.5,
    },
    markAllButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.iconBg.blue,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text.primary,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
