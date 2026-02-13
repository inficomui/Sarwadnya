import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { useGetNotificationsQuery } from '../../redux/apies/notificationApi';

interface DashboardHeaderProps {
    name: string;
    avatarUrl?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ name, avatarUrl }) => {
    const router = useRouter();
    const { colors } = useTheme();
    const { data: notificationData } = useGetNotificationsQuery({
        page: 1,
        per_page: 50
    });

    const styles = useMemo(() => createStyles(colors), [colors]);

    const notifications = notificationData?.data?.data || [];
    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.username}>{name || "User"}</Text>
            </View>
            <View style={styles.rightSection}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push('/notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {(name || "U").charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.xs,
    },
    greeting: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    username: {
        fontSize: FontSize.huge,
        fontWeight: 'bold',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.status.error,
        borderWidth: 1.5,
        borderColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        lineHeight: 12,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.background.card,
        ...Shadow.small,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.primary.start,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
});
