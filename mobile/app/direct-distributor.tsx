import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WalletActionModal } from '../components/wallet/WalletActionModal';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { DirectReferral } from '../lib/types';
import { useGetUserDashboardQuery } from '../redux/apies/dashboardApi';
import { useGetDirectTreeQuery } from '../redux/apies/treeApi';

const { width } = Dimensions.get('window');

export default function DirectDistributorScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selectedReferral, setSelectedReferral] = useState<DirectReferral | null>(null);

    const { data: dashboardData } = useGetUserDashboardQuery();
    const { data: directTreeData, isLoading, isFetching } = useGetDirectTreeQuery({
        page,
        search: searchQuery
    });

    const referralCode = dashboardData?.data?.referral?.code || '';
    const stats = directTreeData?.data?.stats;
    const referrals = directTreeData?.data?.referrals?.data || [];
    const pagination = directTreeData?.data?.referrals;

    const handleShare = async () => {
        try {
            const shareUrl = `https://shreesarwadnya.com/register?ref=${referralCode}`;
            await Share.share({
                message: `Join me on Shree Sarwadnya! Use my referral code: ${referralCode}\nRegister here: ${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleRefresh = () => {
        setPage(1);
    };

    const renderReferralCard = ({ item }: { item: DirectReferral }) => (
        <View style={styles.memberCard}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={[colors.primary.start, colors.primary.end]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>
                    {item.is_active && <View style={styles.activeBadge} />}
                </View>

                <View style={styles.memberInfo}>
                    <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.memberCode}>{item.referral_code}</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setSelectedReferral(item)}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.text.muted} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Investment</Text>
                    <Text style={styles.statValue}>₹{parseFloat(item.total_investment || '0').toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Commission</Text>
                    <Text style={[styles.statValue, { color: colors.status.success }]}>
                        ₹{parseFloat(item.commission_earned || '0').toLocaleString()}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Joined</Text>
                    <Text style={styles.statValue}>
                        {new Date(item.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>

            <View style={styles.contactRow}>
                <TouchableOpacity style={styles.contactItem}>
                    <Ionicons name="call-outline" size={16} color={colors.primary.start} />
                    <Text style={styles.contactText}>{item.phone_number}</Text>
                </TouchableOpacity>
                <View style={[styles.statusTag, { backgroundColor: item.is_active ? colors.status.success + '20' : colors.status.error + '20' }]}>
                    <Text style={[styles.statusTagText, { color: item.is_active ? colors.status.success : colors.status.error }]}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Direct Referrals</Text>
                    <Text style={styles.headerSubtitle}>Manage your first level</Text>
                </View>
                <TouchableOpacity onPress={handleRefresh} style={styles.backButton}>
                    <Ionicons name="refresh" size={20} color={colors.text.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={referrals}
                renderItem={renderReferralCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* Summary Card */}
                        <LinearGradient
                            colors={[colors.primary.start, colors.primary.end]}
                            style={styles.summaryCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Total Direct</Text>
                                    <Text style={styles.summaryValue}>{stats?.total_count || 0}</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Active</Text>
                                    <Text style={styles.summaryValue}>{stats?.active_count || 0}</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Commission</Text>
                                    <Text style={styles.summaryValue}>₹{(stats?.total_commission || 0).toLocaleString()}</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Invite Banner */}
                        <TouchableOpacity style={styles.inviteBanner} onPress={handleShare}>
                            <View style={styles.inviteIcon}>
                                <Ionicons name="person-add-outline" size={24} color={colors.primary.start} />
                            </View>
                            <View style={styles.inviteTextContainer}>
                                <Text style={styles.inviteTitle}>Invite Friends</Text>
                                <Text style={styles.inviteSubtitle}>Earn commission on their investments</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                        </TouchableOpacity>

                        {/* Search Bar */}
                        <View style={styles.searchSection}>
                            <View style={styles.searchBar}>
                                <Ionicons name="search-outline" size={20} color={colors.text.muted} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search by name or code..."
                                    placeholderTextColor={colors.text.muted}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery !== '' && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={20} color={colors.text.muted} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color={colors.primary.start} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="people-outline" size={64} color={colors.text.muted} />
                            </View>
                            <Text style={styles.emptyTitle}>No Referrals Found</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? "Try a different search term" : "Start building your team today!"}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity style={styles.emptyButton} onPress={handleShare}>
                                    <Text style={styles.emptyButtonText}>Invite Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }
                ListFooterComponent={
                    pagination && pagination.last_page > 1 ? (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                                onPress={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <Ionicons name="chevron-back" size={20} color={page === 1 ? colors.text.muted : colors.text.primary} />
                            </TouchableOpacity>
                            <Text style={styles.pageLabel}>Page {page} of {pagination.last_page}</Text>
                            <TouchableOpacity
                                style={[styles.pageButton, page === pagination.last_page && styles.pageButtonDisabled]}
                                onPress={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                            >
                                <Ionicons name="chevron-forward" size={20} color={page === pagination.last_page ? colors.text.muted : colors.text.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {selectedReferral && (
                <WalletActionModal
                    visible={!!selectedReferral}
                    onClose={() => setSelectedReferral(null)}
                    referral={selectedReferral}
                    onSuccess={() => {
                        handleRefresh();
                        setSelectedReferral(null);
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
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
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 10,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    listContent: {
        padding: Spacing.xl,
        paddingTop: Spacing.md,
    },
    summaryCard: {
        borderRadius: BorderRadius.xxl,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        ...Shadow.medium,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: '#fff',
    },
    summaryDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    inviteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(252, 163, 17, 0.08)' : '#FEF3C7',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(252, 163, 17, 0.2)' : '#FDE68A',
    },
    inviteIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    inviteTextContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    inviteTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: isDark ? colors.primary.start : '#92400E',
    },
    inviteSubtitle: {
        fontSize: 12,
        color: isDark ? colors.text.secondary : '#B45309',
        marginTop: 2,
    },
    searchSection: {
        marginBottom: Spacing.xl,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        height: 50,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    memberCard: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: '#fff',
    },
    activeBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.status.success,
        borderWidth: 2,
        borderColor: colors.background.card,
    },
    memberInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    memberName: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    memberCode: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    actionButton: {
        padding: 4,
    },
    cardDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: Spacing.md,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        color: colors.text.muted,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: FontSize.xs,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    emptyContainer: {
        padding: Spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: FontSize.md,
        color: colors.text.muted,
        textAlign: 'center',
        marginBottom: Spacing.xxl,
    },
    emptyButton: {
        backgroundColor: colors.primary.start,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadow.small,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FontSize.md,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        gap: Spacing.xl,
    },
    pageButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
});
