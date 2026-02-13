import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReferralActionModal } from '../components/growth/ReferralActionModal';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { useGetTreeSummaryQuery, useGetTreeUsersQuery } from '../redux/apies/treeApi';

const { width } = Dimensions.get('window');

export default function TeamScreen() {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const router = useRouter();
    const params = useLocalSearchParams();

    const [selectedReferral, setSelectedReferral] = useState<{ id: number; name: string } | null>(null);
    const [isActionModalVisible, setIsActionModalVisible] = useState(false);

    // Internal level validation (API expects 1 to 10)
    const clampLevel = (val: any): number => {
        const num = Math.floor(Number(val));
        if (isNaN(num) || num < 1) return 1;
        if (num > 10) return 10;
        return num;
    };

    const [selectedLevel, setSelectedLevel] = useState(clampLevel(params.level));
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data: summaryData, isLoading: loadingSummary } = useGetTreeSummaryQuery();
    const {
        data: usersData,
        isLoading: loadingUsers,
        isFetching,
        refetch
    } = useGetTreeUsersQuery({
        level: selectedLevel,
        page,
        per_page: 50 // Get more users for better browsing
    });

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const levelsRaw = summaryData?.data?.levels || {};

    // Process and sort valid level keys
    const activeLevels = useMemo(() => {
        return Object.entries(levelsRaw)
            .filter(([key]) => key.startsWith('level_'))
            .sort((a, b) => {
                const numA = Number(a[0].replace('level_', ''));
                const numB = Number(b[0].replace('level_', ''));
                return numA - numB;
            });
    }, [levelsRaw]);

    const totalReferrals = summaryData?.data?.total_referrals || 0;

    // Filter users based on search string locally for better UX
    const users = useMemo(() => {
        const list = usersData?.data?.users?.data || [];
        if (!search) return list;

        return list.filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.phone_number.includes(search)
        );
    }, [usersData, search]);

    const scrollRef = React.useRef<ScrollView>(null);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const [scrollX, setScrollX] = useState(0);

    const handleLevelChange = (level: number) => {
        setSelectedLevel(clampLevel(level));
        setPage(1);
    };

    const scrollNext = () => {
        const step = 280;
        if (isAtEnd) {
            scrollRef.current?.scrollTo({ x: 0, animated: true });
        } else {
            scrollRef.current?.scrollTo({ x: scrollX + step, animated: true });
        }
    };

    const handleScroll = (event: any) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const currentX = contentOffset.x;
        setScrollX(currentX);

        const reachedEnd = currentX + layoutMeasurement.width >= contentSize.width - 20;
        if (reachedEnd !== isAtEnd) {
            setIsAtEnd(reachedEnd);
        }
    };

    const renderLevelItem = (levelKey: string, count: number) => {
        const levelNum = Number(levelKey.replace('level_', ''));
        const isActive = selectedLevel === levelNum;

        // Skip levels beyond 10 as per user requirement/error message
        if (levelNum > 10) return null;

        return (
            <TouchableOpacity
                key={levelKey}
                style={[
                    styles.levelItem,
                    isActive && styles.levelItemActive
                ]}
                onPress={() => handleLevelChange(levelNum)}
            >
                <Text style={[styles.levelItemText, isActive && styles.levelItemTextActive]}>
                    Level {levelNum}
                </Text>
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                    <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                        {count}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Network Team</Text>
                    <Text style={styles.headerSubtitle}>{totalReferrals} Members Registered</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.levelSelectorWrapper}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.levelSelector}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {activeLevels.map(([level, count]) => renderLevelItem(level, count as number))}
                </ScrollView>

                <TouchableOpacity
                    style={styles.scrollButton}
                    onPress={scrollNext}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[colors.primary.start, colors.primary.end]}
                        style={styles.scrollButtonGradient}
                    >
                        <Ionicons
                            name={isAtEnd ? "arrow-back" : "arrow-forward"}
                            size={18}
                            color="#fff"
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={colors.text.muted} />
                    <TextInput
                        placeholder="Search by name or email..."
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor={colors.text.muted}
                    />
                    {search !== "" && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>
                        {selectedLevel === 1 ? 'Direct Distributors' : `Level ${selectedLevel} Members`}
                    </Text>
                    {isFetching && <ActivityIndicator size="small" color={colors.primary.start} />}
                </View>

                {loadingUsers && !users.length ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary.start} />
                    </View>
                ) : users.length > 0 ? (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={onRefresh}
                                tintColor={colors.primary.start}
                            />
                        }
                        renderItem={({ item }) => (
                            <View style={[styles.userCard, Shadow.small]}>
                                <View style={styles.userIconWrapper}>
                                    <LinearGradient
                                        colors={[colors.primary.start, colors.primary.end]}
                                        style={styles.userIcon}
                                    >
                                        <Text style={styles.userInitial}>
                                            {item.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </LinearGradient>
                                </View>

                                <View style={styles.userDetails}>
                                    <Text style={styles.userName}>{item.name}</Text>
                                    <View style={styles.metaRow}>
                                        <Ionicons name="mail-outline" size={12} color={colors.text.muted} />
                                        <Text style={styles.metaText}>{item.email}</Text>
                                    </View>
                                    <View style={styles.metaRow}>
                                        <Ionicons name="call-outline" size={12} color={colors.text.muted} />
                                        <Text style={styles.metaText}>{item.phone_number}</Text>
                                    </View>
                                </View>

                                <View style={styles.userFooter}>
                                    <View style={styles.statsRow}>
                                        <View style={styles.infoBox}>
                                            <Text style={styles.infoLabel}>Joining Date</Text>
                                            <Text style={styles.infoValue}>{formatDate(item.created_at)}</Text>
                                        </View>

                                        {(item.total_investment !== undefined || item.investment !== undefined) && (
                                            <View style={[styles.infoBox, { alignItems: 'center' }]}>
                                                <Text style={styles.infoLabel}>Allocated</Text>
                                                <Text style={[styles.infoValue, { color: colors.primary.start }]}>
                                                    ₹{Number(item.total_investment ?? item.investment ?? 0).toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={[styles.infoBox, { alignItems: 'flex-end' }]}>
                                            <Text style={styles.infoLabel}>Earnings</Text>
                                            <Text style={[styles.infoValue, { color: colors.status.success }]}>
                                                ₹{Number(item.commission_earned ?? item.commission ?? item.earnings ?? item.total_payout ?? item.payout ?? 0).toLocaleString('en-IN')}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.manageButtonFull}
                                        onPress={() => {
                                            setSelectedReferral({ id: item.id, name: item.name });
                                            setIsActionModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.manageButtonText}>Manage User</Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.primary.start} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrapper}>
                            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Members Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {search ? `No team members match "${search}" at this level.` : `There are currently no distributors recruited at Level ${selectedLevel}.`}
                        </Text>
                    </View>
                )}
            </View>

            <ReferralActionModal
                visible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                referral={selectedReferral}
                onSuccess={refetch}
            />
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
    headerCenter: {
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    levelSelectorWrapper: {
        backgroundColor: colors.background.card,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    levelSelector: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    scrollButton: {
        paddingRight: Spacing.md,
        paddingLeft: Spacing.xs,
        backgroundColor: colors.background.card,
    },
    scrollButtonGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    levelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
    },
    levelItemActive: {
        backgroundColor: colors.primary.start,
        borderColor: colors.primary.start,
    },
    levelItemText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    levelItemTextActive: {
        color: '#fff',
    },
    badge: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.text.secondary,
    },
    badgeTextActive: {
        color: '#fff',
    },
    searchContainer: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 46,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: FontSize.sm,
        color: colors.text.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    listTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    listContent: {
        paddingBottom: 40,
    },
    userCard: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    userIconWrapper: {
        position: 'absolute',
        top: Spacing.lg,
        left: Spacing.lg,
    },
    userIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userDetails: {
        marginLeft: 60,
        marginBottom: Spacing.lg,
    },
    userName: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    metaText: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    userFooter: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoBox: {
        gap: 2,
    },
    infoLabel: {
        fontSize: 10,
        color: colors.text.muted,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text.primary,
    },
    manageButtonFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary.start + '15',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
        width: '100%',
    },
    manageButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.primary.start,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
});
