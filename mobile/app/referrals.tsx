import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGetReferralDashboardSummaryQuery, useGetReferralEarningsHistoryQuery } from '../redux/apies/referralApi';
import { useGetTreeSummaryQuery } from '../redux/apies/treeApi';

const { width } = Dimensions.get('window');

export default function ReferralsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useGetReferralDashboardSummaryQuery();
    const { data: earnings, isLoading: loadingEarnings, refetch: refetchEarnings, isFetching } = useGetReferralEarningsHistoryQuery();

    // Fetch user counts (network size) per level
    const { data: treeSummary, refetch: refetchTree } = useGetTreeSummaryQuery();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const onRefresh = useCallback(() => {
        refetchSummary();
        refetchEarnings();
        refetchTree();
    }, [refetchSummary, refetchEarnings, refetchTree]);

    const stats = summary?.data?.level_wise_earnings || summary?.data?.levels_earnings || {};
    const totalEarnings = summary?.data?.total_earnings ??
        summary?.data?.total_earning ??
        summary?.data?.referral_commission ??
        summary?.data?.total_referral_commission ??
        summary?.data?.referral_income ?? 0;
    const history = earnings?.data?.data || [];

    if (loadingSummary && !summary) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.start} />
            </View>
        );
    }

    const calculatedStats = React.useMemo(() => {
        const stats: Record<string, number> = {};
        if (history.length > 0) {
            history.forEach(item => {
                const lvl = item.level;
                const amt = parseFloat(item.amount) || 0;
                stats[lvl] = (stats[lvl] || 0) + amt;
            });
        }
        return stats;
    }, [history]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Network & Earnings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={colors.primary.start} />}
            >
                {/* Total Referral Earnings Card */}
                <LinearGradient
                    colors={Gradients.primary as [string, string, ...string[]]}
                    style={[styles.mainCard, Shadow.medium]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardLabel}>Total Referral Commission</Text>
                        <Text style={styles.cardValue}>₹{Number(totalEarnings).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.cardIconWrapper}>
                        <Ionicons name="people" size={40} color="rgba(255,255,255,0.3)" />
                    </View>
                </LinearGradient>

                {/* Share Link Button */}
                <TouchableOpacity
                    style={[styles.shareCard, Shadow.small]}
                    onPress={async () => {
                        const code = summary?.data?.referral_code || user?.referral_code;
                        const link = summary?.data?.referral_link || `http://shreesarwadnya.com/signup?ref=${code || ''}`;

                        if (!code) {
                            Toast.show({
                                type: 'error',
                                'text1': 'Error',
                                text2: 'Referral code not found. Please try again later.'
                            });
                            return;
                        }
                        try {
                            await Share.share({
                                message: `Join Shree Sarwadnya All in one Solutions using my referral link: ${link}`,
                                url: link,
                                title: 'Join Shree Sarwadnya'
                            }, {
                                dialogTitle: 'Share Referral Link',
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    }}
                >
                    <View style={styles.shareIcon}>
                        <Ionicons name="share-social" size={20} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.shareTitle}>Share Referral Link</Text>
                        <Text style={styles.shareSubtitle}>Invite friends and earn rewards</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>

                {/* Level Wise Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Network Levels</Text>
                    <TouchableOpacity onPress={() => router.push('/team' as any)}>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.levelGrid}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((levelNum) => {
                        // Robust lookup for level earnings
                        let amount = stats[`level_${levelNum}`] ||
                            stats[`level${levelNum}`] ||
                            stats[levelNum.toString()] ||
                            0;

                        // If API stats are missing/zero but we have local history calculations, use those
                        if (!amount && calculatedStats[levelNum]) {
                            amount = calculatedStats[levelNum];
                        }

                        // Robust lookup for level user count
                        const userLevels = treeSummary?.data?.levels || {};
                        const userCount = userLevels[`level_${levelNum}`] ||
                            userLevels[`level${levelNum}`] ||
                            userLevels[levelNum.toString()] ||
                            0;

                        return (
                            <TouchableOpacity
                                key={`level-${levelNum}`}
                                style={[styles.levelCard, Shadow.small]}
                                onPress={() => router.push({ pathname: '/team' as any, params: { level: levelNum } })}
                            >
                                <View style={styles.levelHeader}>
                                    <View>
                                        <Text style={styles.levelLabel}>Level {levelNum}</Text>
                                        <Text style={styles.memberCount}>{userCount} Members</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
                                </View>
                                {amount > 0 ? (
                                    <View>
                                        <Text style={styles.levelValue}>₹{Number(amount).toLocaleString('en-IN')}</Text>
                                        <Text style={styles.levelSubtext}>Total Earnings</Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.levelValue, { color: colors.text.muted, fontSize: FontSize.md }]}>--</Text>
                                        <Text style={styles.levelSubtext}>No Earnings</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Earnings History */}
                <Text style={styles.sectionTitle}>Referral History</Text>
                {loadingEarnings && !history.length ? (
                    <ActivityIndicator color={colors.primary.start} />
                ) : history.length > 0 ? (
                    history.map((item) => (
                        <View key={item.id} style={[styles.historyItem, Shadow.small]}>
                            <View style={styles.historyIcon}>
                                <Ionicons name="person-add" size={20} color={colors.primary.start} />
                            </View>
                            <View style={styles.historyDetails}>
                                <Text style={styles.historyUser}>{item.source_user.name}</Text>
                                <Text style={styles.historyMeta}>Level {item.level} • {new Date(item.payout_date).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.historyAmount}>+₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="share-social-outline" size={48} color={colors.text.muted} />
                        <Text style={styles.emptyText}>No referral earnings yet</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView >
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    mainCard: {
        padding: 24,
        borderRadius: BorderRadius.xxl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    cardInfo: {
        flex: 1,
    },
    cardLabel: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardIconWrapper: {
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: Spacing.md,
        marginTop: Spacing.md,
    },
    levelGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    levelCard: {
        width: (width - Spacing.xl * 2 - Spacing.md) / 2,
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    levelLabel: {
        fontSize: FontSize.xs,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: '700',
    },
    memberCount: {
        fontSize: 10,
        color: colors.primary.start,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    levelValue: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: BorderRadius.lg,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary.start + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyDetails: {
        flex: 1,
    },
    historyUser: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    historyMeta: {
        fontSize: 11,
        color: colors.text.muted,
    },
    historyAmount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.status.success,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 10,
        color: colors.text.muted,
        fontSize: FontSize.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    seeAll: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: colors.primary.start,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelSubtext: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 4,
    },
    shareCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    shareIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary.start,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    shareTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 2,
    },
    shareSubtitle: {
        fontSize: 12,
        color: colors.text.muted,
    },
});
