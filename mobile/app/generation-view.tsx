import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { useGetTreeInvestmentSummaryQuery, useGetTreeSummaryQuery, useGetTreeUsersQuery, useGetReferralLevelStatusQuery } from '../redux/apies/treeApi';

const { width } = Dimensions.get('window');

export default function GenerationViewScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [page, setPage] = useState(1);

    const { data: treeSummary, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetTreeSummaryQuery();
    const { data: levelStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useGetReferralLevelStatusQuery();
    const { data: investmentSummary, isLoading: isInvestmentLoading, refetch: refetchInvestmentSummary } = useGetTreeInvestmentSummaryQuery();
    const { data: levelUsers, isLoading: isUsersLoading, refetch: refetchUsers, isFetching } = useGetTreeUsersQuery({
        level: selectedLevel,
        page: page,
        per_page: 10
    });

    const styles = useMemo(() => createStyles(colors), [colors]);

    const onRefresh = useCallback(() => {
        refetchSummary();
        refetchStatus();
        refetchInvestmentSummary();
        refetchUsers();
    }, [refetchSummary, refetchStatus, refetchInvestmentSummary, refetchUsers]);

    const totalReferrals = treeSummary?.data?.summary?.total_team ?? 0;
    const unlockedLevelsCount = treeSummary?.data?.summary?.unlocked_levels ?? 1;
    const totalTeamBusiness = treeSummary?.data?.summary?.total_team_investment ?? 0;
    const totalDirectBusiness = treeSummary?.data?.summary?.total_direct_investment ?? 0;

    // Next level logic
    const nextLevelTarget = unlockedLevelsCount * 100000;
    const progressPercent = Math.min((totalDirectBusiness / nextLevelTarget), 1);
    
    const levels = treeSummary?.data?.levels || {};
    const statusLevels = levelStatus?.data?.levels || {};
    const investmentLevels = investmentSummary?.data?.levels || {};

    const maxLevel = Math.max(
        ...Object.keys(levels)
            .filter(key => key.startsWith('level_'))
            .map(key => parseInt(key.replace('level_', ''))),
        9
    );

    const handleLevelChange = (level: number) => {
        setSelectedLevel(level);
        setPage(1);
    };

    const renderLevelButton = ({ item }: { item: number }) => {
        const levelKey = `level_${item}`;
        const levelData = levels[levelKey];
        const statusData = statusLevels[levelKey];
        
        const count = levelData?.total || 0;
        const investment = investmentLevels[levelKey] || 0;
        const isActive = selectedLevel === item;
        const isUnlocked = statusData ? statusData.is_unlocked : (levelData?.unlocked !== false);

        if (isActive) {
            return (
                <TouchableOpacity
                    onPress={() => handleLevelChange(item)}
                    activeOpacity={0.9}
                    style={styles.levelCardWrapper}
                >
                    <LinearGradient
                        colors={Gradients.primary as [string, string, ...string[]]}
                        style={[styles.levelCard, styles.activeLevelCard]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.levelHeader}>
                            <Text style={[styles.levelLabel, styles.textWhite, { opacity: 0.9 }]}>
                                Level {item}
                            </Text>
                            <View style={styles.activeIconBadge}>
                                <Ionicons name={isUnlocked ? "stats-chart" : "lock-closed"} size={12} color={colors.primary.start} />
                            </View>
                        </View>
                        <Text style={[styles.levelCount, styles.textWhite]}>
                            {count} {count === 1 ? 'Member' : 'Members'}
                        </Text>
                        <View style={styles.investmentBadge}>
                            <Text style={styles.investmentBadgeLabel}>Invested</Text>
                            <Text style={styles.investmentBadgeValue}>
                                ₹{Number(investment).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[
                    styles.levelCardWrapper, 
                    styles.levelCard, 
                    styles.inactiveLevelCard, 
                    !isUnlocked ? styles.lockedLevelCard : styles.unlockedLevelCard
                ]}
                onPress={() => handleLevelChange(item)}
                activeOpacity={0.7}
            >
                <View style={styles.levelHeader}>
                    <View>
                        <Text style={[styles.levelLabel, !isUnlocked ? { color: colors.text.muted } : { color: colors.status.success }]}>
                            Level {item}
                        </Text>
                        <View style={styles.statusRow}>
                            <Ionicons 
                                name={isUnlocked ? "shield-checkmark" : "lock-closed"} 
                                size={10} 
                                color={isUnlocked ? colors.status.success : colors.status.error} 
                            />
                            <Text style={[styles.statusText, { color: isUnlocked ? colors.status.success : colors.status.error }]}>
                                {isUnlocked ? "Active" : "Locked"}
                            </Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={isUnlocked ? "chevron-forward" : "lock-closed"} 
                        size={16} 
                        color={isUnlocked ? colors.text.muted : colors.status.error} 
                    />
                </View>
                <Text style={[styles.levelCount, !isUnlocked && { color: colors.text.muted }]}>
                    {count} {count === 1 ? 'Member' : 'Members'}
                </Text>
                <Text style={styles.levelInvestment}>
                    ₹{Number(investment).toLocaleString('en-IN')}
                </Text>
                {!isUnlocked && statusData?.required_business > 0 && (
                    <Text style={styles.lockedText}>Need ₹{statusData.required_business.toLocaleString()}</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderUserItem = ({ item }: { item: any }) => {
        const isActive = (item.total_investment > 0 || item.investment > 0 || item.is_active);
        return (
            <View style={styles.userCard}>
                <View style={styles.userHeader}>
                    <View style={styles.userInfoRow}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>
                                {item.name ? item.name.substring(0, 2).toUpperCase() : 'NA'}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
                            <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                            <View style={styles.dateBadge}>
                                <Ionicons name="calendar-outline" size={10} color={colors.text.muted} />
                                <Text style={styles.dateText}>
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? colors.status.success + '15' : colors.background.secondary }]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? colors.status.success : colors.text.muted }]} />
                        <Text style={[styles.statusText, isActive && { color: colors.status.success }]}>{isActive ? 'Active' : 'Inactive'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.userStats}>
                    <View style={styles.userStat}>
                        <Text style={styles.userStatLabel}>Total Investment</Text>
                        <Text style={styles.userStatValue}>
                            ₹{Number(item.total_investment ?? item.investment ?? item.invested_amount ?? 0).toLocaleString('en-IN')}
                        </Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.userStat}>
                        <Text style={styles.userStatLabel}>Commission Earned</Text>
                        <Text style={[styles.userStatValue, { color: colors.status.success }]}>
                            ₹{Number(item.commission_earned ?? item.commission ?? item.earnings ?? item.total_payout ?? item.payout ?? 0).toLocaleString('en-IN')}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if ((isSummaryLoading || isStatusLoading) && !treeSummary) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.start} />
                    <Text style={styles.loadingText}>Loading network...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Generation View</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Ionicons
                        name="refresh"
                        size={24}
                        color={colors.text.primary}
                        style={isFetching && { transform: [{ rotate: '360deg' }] }}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={colors.primary.start} />
                }
            >
                {/* Level Progress Gauge */}
                <View style={[styles.progressCard, { backgroundColor: colors.background.card }]}>
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={styles.progressTitle}>Level {unlockedLevelsCount + 1} Progress</Text>
                            <Text style={styles.progressSubtitle}>Direct Business: ₹{totalDirectBusiness.toLocaleString()}</Text>
                        </View>
                        <View style={styles.badgeContainer}>
                             <Text style={styles.unlockedBadge}>{unlockedLevelsCount} Unlocked</Text>
                        </View>
                    </View>
                    
                    <View style={styles.progressBarBg}>
                        <LinearGradient
                            colors={[colors.primary.start, colors.primary.end]}
                            style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </View>
                    
                    <View style={styles.progressFooter}>
                        <Text style={styles.progressFooterText}>
                            Goal: ₹{nextLevelTarget.toLocaleString()} (₹{(nextLevelTarget - totalDirectBusiness > 0 ? nextLevelTarget - totalDirectBusiness : 0).toLocaleString()} more)
                        </Text>
                        <Text style={styles.progressPercentText}>{Math.round(progressPercent * 100)}%</Text>
                    </View>

                    {/* Requirements Cheat Sheet */}
                    <View style={styles.requirementsList}>
                        <Text style={styles.requirementsTitle}>UNLOCkING RULES (DIRECT BUSINESS ONLY)</Text>
                        <View style={styles.requirementsRow}>
                            <Text style={styles.requirementText}>LVL 2: ₹1.0 L</Text>
                            <Text style={styles.requirementText}>LVL 4: ₹3.0 L</Text>
                            <Text style={styles.requirementText}>LVL 6: ₹5.0 L</Text>
                        </View>
                        <View style={styles.requirementsRow}>
                            <Text style={styles.requirementText}>LVL 3: ₹2.0 L</Text>
                            <Text style={styles.requirementText}>LVL 5: ₹4.0 L</Text>
                            <Text style={styles.requirementText}>LVL 9: ₹8.0 L</Text>
                        </View>
                    </View>
                </View>

                {/* Summary Grid */}
                <View style={styles.summaryGrid}>
                    <LinearGradient
                        colors={Gradients.primary as [string, string, ...string[]]}
                        style={styles.summaryCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="briefcase" size={24} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.summaryLabel}>Total Team Business</Text>
                        <Text style={styles.summaryValue}>₹{Number(totalTeamBusiness).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={Gradients.accent2 as [string, string, ...string[]]}
                        style={styles.summaryCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="people" size={24} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.summaryLabel}>Net Connections</Text>
                        <Text style={styles.summaryValue}>{totalReferrals}</Text>
                    </LinearGradient>
                </View>

                {/* Level Selector */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Network Levels</Text>
                        <Text style={styles.sectionSubtitle}>1 - {maxLevel} Generations</Text>
                    </View>
                    <FlatList
                        data={Array.from({ length: maxLevel }, (_, i) => i + 1)}
                        renderItem={renderLevelButton}
                        keyExtractor={(item) => item.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.levelList}
                    />
                </View>

                {/* Users List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Level {selectedLevel} Members ({levels[`level_${selectedLevel}`]?.total || 0})
                    </Text>

                    {isUsersLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary.start} />
                        </View>
                    ) : levelUsers?.data?.users?.data?.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
                            <Text style={styles.emptyTitle}>No members found</Text>
                            <Text style={styles.emptySubtitle}>
                                This level doesn't have any members yet
                            </Text>
                        </View>
                    ) : (
                        <>
                            {levelUsers?.data?.users?.data?.map((user: any) => (
                                <View key={user.id}>
                                    {renderUserItem({ item: user })}
                                </View>
                            ))}

                            {/* Pagination */}
                            {(() => {
                                const lastPage = levelUsers?.data?.users?.last_page || 1;
                                if (lastPage <= 1) return null;

                                return (
                                    <View style={styles.pagination}>
                                        <TouchableOpacity
                                            style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
                                            onPress={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1} >
                                            <Ionicons name="chevron-back" size={20} color={page === 1 ? colors.text.muted : colors.primary.start} />
                                        </TouchableOpacity>

                                        <Text style={styles.paginationText}>
                                            Page {page} of {lastPage}
                                        </Text>

                                        <TouchableOpacity
                                            style={[styles.paginationButton, page === lastPage && styles.paginationButtonDisabled]}
                                            onPress={() => setPage(p => Math.min(lastPage, p + 1))}
                                            disabled={page === lastPage}
                                        >
                                            <Ionicons name="chevron-forward" size={20} color={page === lastPage ? colors.text.muted : colors.primary.start} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })()}
                        </>
                    )}
                </View>
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
        paddingVertical: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.sm,
        color: colors.text.muted,
        fontSize: FontSize.md,
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
    refreshButton: {
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
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: Spacing.xl,
    },
    summaryCard: {
        flex: 1,
        minWidth: (width - Spacing.xl * 2 - 20) / 2,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        ...Shadow.medium,
        justifyContent: 'center',
    },
    summaryLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        marginTop: Spacing.xs,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 2,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    sectionSubtitle: {
        fontSize: 10,
        color: colors.text.muted,
        fontWeight: '600',
    },
    levelList: {
        paddingRight: Spacing.xl,
    },
    levelCardWrapper: {
        marginRight: Spacing.md,
    },
    levelCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        minWidth: 140,
        minHeight: 110,
        justifyContent: 'space-between',
    },
    inactiveLevelCard: {
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    lockedLevelCard: {
        backgroundColor: colors.background.secondary,
        opacity: 0.8,
    },
    unlockedLevelCard: {
        backgroundColor: colors.status.success + '10',
        borderColor: colors.status.success + '30',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    activeLevelCard: {
        ...Shadow.medium,
        borderWidth: 0,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelLabel: {
        fontSize: 10,
        color: colors.text.secondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activeIconBadge: {
        backgroundColor: '#fff',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelCount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
    },
    textWhite: {
        color: '#fff',
    },
    levelInvestment: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
        fontWeight: '500',
    },
    lockedText: {
        fontSize: 8,
        color: colors.status.error,
        fontWeight: '600',
        marginTop: 4,
    },
    investmentBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    investmentBadgeLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 2,
    },
    investmentBadgeValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    progressCard: {
        padding: 20,
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.medium,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    progressSubtitle: {
        fontSize: 12,
        color: colors.text.muted,
        marginTop: 2,
    },
    badgeContainer: {
        backgroundColor: colors.primary.start + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    unlockedBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary.start,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.background.secondary,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    progressFooterText: {
        fontSize: 10,
        color: colors.text.muted,
        fontStyle: 'italic',
    },
    progressPercentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary.start,
    },
    requirementsList: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    requirementsTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    requirementsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    requirementText: {
        fontSize: 9,
        fontWeight: '600',
        color: colors.text.secondary,
        backgroundColor: colors.background.secondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    userCard: {
        backgroundColor: colors.background.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.start,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    userAvatarText: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    userEmail: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    userStats: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    userStat: {
        flex: 1,
    },
    userStatLabel: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
        marginBottom: 4,
    },
    userStatValue: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.muted,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.lg,
        marginTop: Spacing.lg,
    },
    paginationButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    paginationText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    dateText: {
        fontSize: 10,
        color: colors.text.muted,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: Spacing.md,
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: colors.border,
    },
});
