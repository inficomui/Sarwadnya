import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayoutCard } from '../components/payouts/PayoutCard';
import { PayoutSlipModal } from '../components/payouts/PayoutSlipModal';
import { PayoutSummary } from '../components/payouts/PayoutSummary';
import { FontSize, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { Payout } from '../lib/types';
import { useGetMyPayoutsQuery } from '../redux/apies/payoutApi';

export default function PayoutsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [page, setPage] = useState(1);
    const [payoutsList, setPayoutsList] = useState<Payout[]>([]);
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [isSlipOpen, setIsSlipOpen] = useState(false);
    
    const { data, isLoading, isFetching, refetch } = useGetMyPayoutsQuery({ page });

    const summary = data?.data?.summary;
    const meta = data?.data?.history;

    // Handle data updates and appending for infinite scroll
    React.useEffect(() => {
        if (data?.data?.history?.data) {
            if (page === 1) {
                setPayoutsList(data.data.history.data);
            } else {
                setPayoutsList(prev => [...prev, ...(data?.data?.history?.data || [])]);
            }
        }
    }, [data, page]);

    const onRefresh = useCallback(() => {
        setPage(1);
        refetch();
    }, [refetch]);

    const loadMore = () => {
        if (meta?.last_page && page < meta.last_page && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const handleViewSlip = (payout: Payout) => {
        setSelectedPayout(payout);
        setIsSlipOpen(true);
    };

    const renderItem = ({ item }: { item: Payout }) => (
        <PayoutCard payout={item} onViewSlip={handleViewSlip} />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <PayoutSummary
                totalEarnings={Number(summary?.total_earnings || 0)}
                totalRoi={Number(summary?.total_roi || 0)}
                totalReferral={Number(summary?.total_referral_commission || 0)}
            />
            <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>
    );

    const renderEmpty = () => (
        !isLoading ? (
            <View style={styles.emptyContainer}>
                <Ionicons name="documents-outline" size={48} color={colors.text.muted} />
                <Text style={styles.emptyText}>No payouts found</Text>
            </View>
        ) : null
    );

    const renderFooter = () => (
        isFetching && page > 1 ? (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary.start} />
            </View>
        ) : null
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Payout Reports</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading && page === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.start} />
                </View>
            ) : (
                <FlatList
                    data={payoutsList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
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

            <PayoutSlipModal
                visible={isSlipOpen}
                onClose={() => setIsSlipOpen(false)}
                payout={selectedPayout}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    navTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: Spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyText: {
        marginTop: Spacing.md,
        color: colors.text.muted,
        fontSize: FontSize.sm,
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
});
