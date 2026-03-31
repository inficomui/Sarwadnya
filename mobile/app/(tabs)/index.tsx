import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGetUserDashboardQuery } from '../../redux/apies/dashboardApi';

// Modular Components
import { BalanceCard } from '../../components/dashboard/BalanceCard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { ReferralCard } from '../../components/dashboard/ReferralCard';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { DashboardMenuSections } from '../../components/dashboard/DashboardMenuSections';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();
    const { data: dashboardData, isLoading, isFetching, refetch } = useGetUserDashboardQuery();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading && !dashboardData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.start} />
            </View>
        );
    }

    const { profile, financials, account, network, referral, earning_limit, notice } = dashboardData?.data || {};

    const isWalletActive = account?.is_wallet_active ?? false;
    const walletBalance = Number(financials?.available_balance || 0);

    const referralLink = 'https://shreesarwadnya.com/signup?ref=' + user?.referral_code;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.start}
                        colors={[colors.primary.start]}
                    />
                }
            >
                <DashboardHeader
                    name={profile?.name || user?.name || "User"}
                />

                <BalanceCard
                    totalDeposited={Number(financials?.total_deposited || 0)}
                    totalEarnings={Number(financials?.total_earnings || 0)}
                    walletBalance={walletBalance}
                    rank={account?.rank || "Member"}
                    isWalletActive={isWalletActive}
                />

                {/* Status Alerts */}
                {notice && (
                    <View style={styles.noticeBox}>
                        <Ionicons name="information-circle" size={20} color={colors.primary.start} />
                        <View style={styles.alertContent}>
                            <Text style={styles.noticeTitle}>Account Protection Notice</Text>
                            <Text style={styles.noticeMsg}>{notice}</Text>
                        </View>
                    </View>
                )}

                {earning_limit?.reached && (
                    <View style={styles.alertBox}>
                        <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>Earning Limit Reached</Text>
                            <Text style={styles.alertMsg}>{earning_limit.message}</Text>
                        </View>
                    </View>
                )}

                {profile?.kyc_status === 'pending' && (
                    <View style={[styles.alertBox, styles.warningBox]}>
                        <Ionicons name="time" size={20} color={colors.status.warning} />
                        <View style={styles.alertContent}>
                            <Text style={styles.warningTitle}>KYC Verification Pending</Text>
                            <Text style={styles.warningMsg}>Your documents are currently under review.</Text>
                        </View>
                    </View>
                )}

                <QuickActions isWalletActive={isWalletActive} />

                <DashboardMenuSections />

                <StatsGrid
                    directTeam={Number(network?.direct_partners || 0)}
                    totalTeam={Number(network?.total_team_size || 0)}
                />

                {(referral?.code || user?.referral_code) && (
                    <ReferralCard
                        referralCode={referral?.code || user?.referral_code || ''}
                        referralLink={referralLink}
                    />
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: 120,
    },
    alertBox: {
        flexDirection: 'row',
        backgroundColor: colors.status.error + '10',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.status.error + '20',
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    alertContent: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    alertTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.status.error,
    },
    alertMsg: {
        fontSize: FontSize.sm,
        color: colors.status.error,
        opacity: 0.8,
    },
    warningBox: {
        backgroundColor: colors.status.warning + '10',
        borderColor: colors.status.warning + '20',
    },
    warningTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.status.warning,
    },
    warningMsg: {
        fontSize: FontSize.sm,
        color: colors.status.warning,
        opacity: 0.8,
    },
    noticeBox: {
        flexDirection: 'row',
        backgroundColor: colors.primary.start + '10',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.primary.start + '20',
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    noticeTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.primary.start,
    },
    noticeMsg: {
        fontSize: FontSize.sm,
        color: colors.primary.start,
        opacity: 0.8,
    },
});
