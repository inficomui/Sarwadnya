import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetWalletQuery } from '../redux/apies/walletApi';
import { Colors, Spacing, FontSize, BorderRadius, Shadow, Gradients } from '../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../utils/currency';

const { width } = Dimensions.get('window');

export default function WalletHistoryScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [transactionsList, setTransactionsList] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'topups' | 'outflow'>('all');

    const { data, isLoading, isFetching, refetch } = useGetWalletQuery({ page, per_page: 20 });

    const transactions = data?.data?.transactions?.data || [];
    const meta = data?.data?.transactions;

    React.useEffect(() => {
        if (transactions.length > 0) {
            if (page === 1) {
                setTransactionsList(transactions);
            } else {
                setTransactionsList(prev => {
                    // Filter out duplicates
                    const existingIds = prev.map(t => t.id);
                    const newItems = transactions.filter(t => !existingIds.includes(t.id));
                    return [...prev, ...newItems];
                });
            }
        }
    }, [transactions, page]);

    const onRefresh = useCallback(() => {
        setPage(1);
        refetch();
    }, [refetch]);

    const loadMore = () => {
        if (meta?.last_page && page < meta.last_page && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const filteredTransactions = transactionsList.filter(tx => {
        if (activeTab === 'all') return true;

        const type = tx.type?.toLowerCase();
        const desc = tx.description?.toLowerCase() || '';

        if (activeTab === 'earnings') {
            if (type === 'topup' || desc.includes('topup') || desc.includes('top-up') || desc.includes('deposit')) return false;
            return type === 'referral_earning' || type === 'roi' || type === 'payout' ||
                (type === 'credit' && (desc.includes('commission') || desc.includes('bonus') || desc.includes('earning') || desc.includes('roi')));
        }

        if (activeTab === 'topups') {
            return type === 'topup' || desc.includes('topup') || desc.includes('top-up') || desc.includes('deposit');
        }

        if (activeTab === 'outflow') {
            return type === 'debit' || type === 'withdrawal' || type === 'investment' || desc.includes('invest') || desc.includes('withdraw');
        }

        return true;
    });

    const renderItem = ({ item }: { item: any }) => {
        const type = item.type?.toLowerCase();
        const desc = item.description?.toLowerCase() || '';
        const isCredit = item.type === 'credit' || item.type === 'topup' || type === 'referral_earning' || type === 'roi';

        return (
            <View style={[styles.transactionCard, Shadow.small]}>
                <View style={[styles.iconContainer, { backgroundColor: isCredit ? Colors.status.success + '10' : Colors.status.error + '10' }]}>
                    <Ionicons
                        name={isCredit ? "arrow-down-outline" : "arrow-up-outline"}
                        size={20}
                        color={isCredit ? Colors.status.success : Colors.status.error}
                    />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                    <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()} • {item.status}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={[styles.amount, { color: isCredit ? Colors.status.success : Colors.status.error }]}>
                        {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction History</Text>
                <View style={{ width: 44 }} />
            </View>

            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsScroll}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {(['all', 'earnings', 'topups', 'outflow'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab === 'topups' ? 'Top-ups' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading && page === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.start} />
                </View>
            ) : (
                <FlatList
                    data={filteredTransactions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={Colors.primary.start} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={Colors.text.muted} />
                            <Text style={styles.emptyTitle}>No Transactions</Text>
                            <Text style={styles.emptySubtitle}>No transactions found for this category.</Text>
                        </View>
                    }
                    ListFooterComponent={
                        isFetching && page > 1 ? (
                            <ActivityIndicator style={{ marginVertical: 20 }} color={Colors.primary.start} />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
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
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    tabsScroll: {
        maxHeight: 50,
        marginBottom: Spacing.md,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
        alignItems: 'center',
    },
    tab: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    activeTab: {
        backgroundColor: Colors.primary.start,
    },
    tabText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    detailsContainer: {
        flex: 1,
    },
    description: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    date: {
        fontSize: FontSize.xs,
        color: Colors.text.muted,
        marginTop: 2,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.muted,
        marginTop: 4,
    },
});
