import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Investment as Asset, Transfer } from '../../lib/types';
import { useGetMyInvestmentsQuery } from '../../redux/apies/investmentApi';
import { useGetMyTransfersQuery } from '../../redux/apies/transferApi';

// Modular Components
import { AssetCard } from '../../components/growth/AssetCard';
import { AssetSummary } from '../../components/growth/AssetSummary';
import { AssetTabs, AssetTabType } from '../../components/growth/AssetTabs';
import { RequestCard } from '../../components/growth/RequestCard';

export default function AssetsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [filter, setFilter] = useState<AssetTabType>('Active');
    const [search, setSearch] = useState("");
    const {
        data: invResponse,
        isLoading: loadingInv,
        isFetching: fetchingInv,
        refetch: refetchInv
    } = useGetMyInvestmentsQuery();

    const {
        data: transResponse,
        isLoading: loadingTrans,
        isFetching: fetchingTrans,
        refetch: refetchTrans
    } = useGetMyTransfersQuery();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const onRefresh = useCallback(() => {
        refetchInv();
        refetchTrans();
    }, [refetchInv, refetchTrans]);

    const isFetching = fetchingInv || fetchingTrans;
    const isLoading = loadingInv || loadingTrans;

    const assets = useMemo(() => {
        const data = Array.isArray(invResponse?.data)
            ? invResponse.data
            : (invResponse?.data?.data ? invResponse.data.data : []);
        return data as Asset[];
    }, [invResponse]);

    const requests = useMemo(() => {
        return (transResponse?.data?.transfers || []) as Transfer[];
    }, [transResponse]);

    const filteredRequests = useMemo(() => {
        return requests.filter(r =>
            search === "" ||
            r.amount.toString().includes(search) ||
            r.method.toLowerCase().includes(search.toLowerCase())
        );
    }, [requests, search]);

    const filteredAssets = useMemo(() => {
        return assets.filter((inv) => {
            const status = inv.status.toLowerCase();
            const filterLower = filter.toLowerCase();

            let matchesFilter = false;

            if (filter === 'All') {
                matchesFilter = true;
            } else if (filter === 'Active') {
                matchesFilter = status === 'active' || status === 'approved';
            } else {
                matchesFilter = status === filterLower;
            }

            const matchesSearch = search === "" ||
                inv.id.toString().includes(search) ||
                inv.amount.toString().includes(search) ||
                inv.method?.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [assets, filter, search]);

    const activeAssets = useMemo(() => filteredAssets.filter(a => {
        const s = a.status.toLowerCase();
        return s === 'active' || s === 'approved';
    }), [filteredAssets]);

    const completedAssets = useMemo(() => filteredAssets.filter(a => a.status.toLowerCase() === 'completed'), [filteredAssets]);

    const filteredData = useMemo(() => {
        if (filter === 'Requests') {
            return filteredRequests.map(item => ({ ...item, _type: 'request' }));
        }

        if (filter === 'All') {
            // Return combined just for length check and empty state
            return [
                ...filteredAssets.map(item => ({ ...item, _type: 'asset' })),
                ...filteredRequests.map(item => ({ ...item, _type: 'request' }))
            ];
        }

        return filteredAssets.map(item => ({ ...item, _type: 'asset' }));
    }, [filteredAssets, filteredRequests, filter]);

    const stats = useMemo(() => {
        // Total should only include active and approved investments
        const total = assets.reduce((sum, item) => {
            const s = item.status.toLowerCase();
            if (s === 'active' || s === 'approved') {
                return sum + Number(item.amount);
            }
            return sum;
        }, 0);

        const active = assets.filter(i => {
            const s = i.status.toLowerCase();
            return s === 'active' || s === 'approved';
        }).length;

        const completed = assets.filter(i => i.status.toLowerCase() === 'completed').length;
        return { total, active, completed };
    }, [assets]);

    const renderMixedContent = () => {
        // Safe date parser
        const getTime = (dateStr: string) => {
            const t = new Date(dateStr).getTime();
            return isNaN(t) ? 0 : t;
        };

        if (filter === 'All') {
            const hasRequests = filteredRequests.length > 0;
            const hasActive = activeAssets.length > 0;
            const hasCompleted = completedAssets.length > 0;

            if (!hasRequests && !hasActive && !hasCompleted) return null;

            return (
                <View style={styles.listContainer}>
                    {hasRequests && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Requests</Text>
                            {filteredRequests.sort((a, b) => getTime(b.created_at) - getTime(a.created_at)).map((item) => (
                                <RequestCard key={`req-${item.id}`} request={item} />
                            ))}
                        </View>
                    )}

                    {hasActive && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Active Investments</Text>
                            {activeAssets.sort((a, b) => getTime(b.created_at) - getTime(a.created_at)).map((item) => (
                                <AssetCard
                                    key={`asset-${item.id}`}
                                    Asset={item}
                                    onPress={(id) => router.push({ pathname: `/growth/${id}` as any })}
                                />
                            ))}
                        </View>
                    )}

                    {hasCompleted && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>History</Text>
                            {completedAssets.sort((a, b) => getTime(b.created_at) - getTime(a.created_at)).map((item) => (
                                <AssetCard
                                    key={`asset-${item.id}`}
                                    Asset={item}
                                    onPress={(id) => router.push({ pathname: `/growth/${id}` as any })}
                                />
                            ))}
                        </View>
                    )}
                </View>
            );
        }

        // Just render the list for other tabs
        return (
            <View style={styles.listContainer}>
                {filteredData.map((item: any) => {
                    if (item._type === 'request') {
                        return <RequestCard key={`req-${item.id}`} request={item as Transfer} />;
                    }
                    return (
                        <AssetCard
                            key={`asset-${item.id}`}
                            Asset={item as Asset}
                            onPress={(id) => router.push({ pathname: `/growth/${id}` as any })}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Investments Portfolio</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color={colors.text.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${filter === 'Requests' ? 'requests' : 'assets'}...`}
                        placeholderTextColor={colors.text.muted}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.start}
                    />
                }
            >
                <AssetSummary
                    totalAllocated={stats.total}
                    activeCount={stats.active}
                    completedCount={stats.completed}
                />

                <AssetTabs activeTab={filter} onTabChange={setFilter} />

                {isLoading && !assets.length && !requests.length ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary.start} />
                    </View>
                ) : filteredData.length > 0 ? (
                    renderMixedContent()
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconWrapper}>
                            <Ionicons
                                name={filter === 'Requests' ? "time-outline" : "receipt-outline"}
                                size={64}
                                color={colors.text.muted}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {filter === 'Requests' ? "No Requests" : filter === 'All' ? "No Items Found" : "No Assets Found"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {search ? "No matches found for your search." :
                                filter === 'Requests' ? "You haven't submitted any investment requests yet." :
                                    filter === 'All' ? "You don't have any investments or requests yet." :
                                        `You don't have any ${filter.toLowerCase()} assets yet.`}
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push('/growth/new' as any)}
                        >
                            <LinearGradient
                                colors={Gradients.primary as [string, string, ...string[]]}
                                style={styles.emptyButtonGradient}
                            >
                                <Text style={styles.emptyButtonText}>Add New Asset</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/growth/new' as any)}
            >
                <LinearGradient
                    colors={Gradients.primary as [string, string, ...string[]]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
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
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 120, // Increased to clear tab bar and FAB
    },
    centerContainer: {
        padding: 40,
        alignItems: 'center',
    },
    listContainer: {
        marginTop: 4,
    },
    searchContainer: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    emptyButton: {
        borderRadius: 14,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    emptyButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FontSize.md,
    },
    fab: {
        position: 'absolute',
        bottom: 100, // Moved up to clear the 80px tab bar area
        right: 24,
        ...Shadow.large,
        zIndex: 100,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
});
