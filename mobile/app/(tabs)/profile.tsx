import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGetUserDashboardQuery } from '../../redux/apies/dashboardApi';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { colors, isDark } = useTheme();
    const { data: dashboardData, refetch, isFetching } = useGetUserDashboardQuery();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout }
            ]
        );
    };

    const stats = {
        Assets: '-', // Not available in dashboard summary directly
        value: dashboardData?.data?.financials?.total_deposited ? `₹${Number(dashboardData.data.financials.total_deposited) / 1000}k` : '-',
        referrals: dashboardData?.data?.network?.direct_partners ?? '-'
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background.primary} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Header */}
                <View style={styles.profileHeaderContainer}>
                    <LinearGradient
                        colors={Gradients.primary as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileCard}
                    >
                        {/* Decorative circles */}
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />

                        <View style={styles.profileCardContent}>
                            {/* User Initial Badge */}
                            <View style={styles.initialBadge}>
                                <Text style={styles.initialText}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
                                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>

                                {/* Quick Stats */}
                                <View style={styles.quickStats}>
                                    {user?.is_wallet_active && (
                                        <View style={styles.statBadge}>
                                            <Ionicons name="wallet" size={14} color="#fff" />
                                            <Text style={styles.statBadgeText}>{stats.value}</Text>
                                        </View>
                                    )}
                                    <View style={styles.statBadge}>
                                        <Ionicons name="people" size={14} color="#fff" />
                                        <Text style={styles.statBadgeText}>{stats.referrals} Refs</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Stats Cards Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: colors.iconBg.purple }]}>
                                <Ionicons name="trending-up" size={20} color={colors.primary.start} />
                            </View>
                            <Text style={styles.statCardValue}>{stats.Assets}</Text>
                            <Text style={styles.statCardLabel}>Active</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: colors.iconBg.blue }]}>
                                <Ionicons name="cash" size={20} color="#3b82f6" />
                            </View>
                            <Text style={styles.statCardValue}>{stats.value}</Text>
                            <Text style={styles.statCardLabel}>Value</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: colors.iconBg.green }]}>
                                <Ionicons name="people" size={20} color="#10b981" />
                            </View>
                            <Text style={styles.statCardValue}>{stats.referrals}</Text>
                            <Text style={styles.statCardLabel}>Team</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/personal-details')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.purple }]}>
                            <Ionicons name="person-outline" size={20} color={colors.primary.start} />
                        </View>
                        <Text style={styles.menuText}>Personal Information</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    {user?.is_wallet_active && (
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/bank-details')}>
                            <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.blue }]}>
                                <Ionicons name="card-outline" size={20} color="#3b82f6" />
                            </View>
                            <Text style={styles.menuText}>Bank Details</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/kyc')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.yellow }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#f59e0b" />
                        </View>
                        <Text style={styles.menuText}>KYC Verification</Text>
                        <View style={[styles.verifiedBadge, {
                            backgroundColor: user?.kyc_status === 'approved' ? colors.iconBg.green : colors.iconBg.red
                        }]}>
                            <Text style={[styles.verifiedText, {
                                color: user?.kyc_status === 'approved' ? colors.status.success : colors.status.error
                            }]}>
                                {user?.kyc_status === 'approved' ? 'Verified' : 'Status'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/referrals')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.indigo }]}>
                            <Ionicons name="people-outline" size={20} color={colors.icon.indigo} />
                        </View>
                        <Text style={styles.menuText}>Referrals & Team</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/generation-view')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.violet }]}>
                            <Ionicons name="git-network-outline" size={20} color="#7c3aed" />
                        </View>
                        <Text style={styles.menuText}>Generation View</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/direct-distributor')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.yellow }]}>
                            <Ionicons name="flash-outline" size={20} color="#ea580c" />
                        </View>
                        <Text style={styles.menuText}>Direct Distributor</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Other menu sections remain static/placeholder for now */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>Preferences</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.green }]}>
                            <Ionicons name="notifications-outline" size={20} color="#10b981" />
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/security-settings')}>
                        <View style={[styles.menuIcon, { backgroundColor: colors.iconBg.sky }]}>
                            <Ionicons name="lock-closed-outline" size={20} color="#0369a1" />
                        </View>
                        <Text style={styles.menuText}>Security Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LinearGradient
                        colors={['#f87171', '#ef4444']}
                        style={styles.logoutGradient}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileHeaderContainer: {
        paddingHorizontal: 10,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
        gap: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text.primary,
        flex: 1,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    profileCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        ...Shadow.medium,
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -50,
        right: -30,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -20,
        left: -20,
    },
    profileCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    initialBadge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    initialText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 12,
    },
    quickStats: {
        flexDirection: 'row',
        gap: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.card,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statCardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 2,
    },
    statCardLabel: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '500',
    },
    menuSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    menuSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    verifiedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
    },
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.text.muted,
        marginBottom: 8,
    },
});
