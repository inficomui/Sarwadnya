import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGetUserDashboardQuery } from '../../redux/apies/dashboardApi';
import { useGetWalletQuery, useRequestTopupMutation } from '../../redux/apies/walletApi';

// Modular Components
import { TopUpModal } from '../../components/wallet/TopUpModal';
import { TransactionItem } from '../../components/wallet/TransactionItem';
import UserSelectionModal from '../../components/wallet/UserSelectionModal';
import WalletActionModal from '../../components/wallet/WalletActionModal';
import { WalletCard } from '../../components/wallet/WalletCard';
import WithdrawalModal from '../../components/wallet/WithdrawalModal';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { data: walletData, isLoading, isFetching, refetch } = useGetWalletQuery();
    const { data: dashboardData } = useGetUserDashboardQuery();
    const [requestTopup, { isLoading: isSubmitting }] = useRequestTopupMutation();
    const notice = dashboardData?.data?.notice;

    const styles = useMemo(() => createStyles(colors), [colors]);

    const [modalVisible, setModalVisible] = useState(false);
    const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
    const [userSelectionVisible, setUserSelectionVisible] = useState(false);
    const [walletActionVisible, setWalletActionVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email?: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'topups' | 'outflow'>('all');

    // Access Guard
    React.useEffect(() => {
        if (user && !user.is_wallet_active) {
            router.replace('/(tabs)');
            Toast.show({
                type: 'error',
                text1: 'Access Denied',
                text2: 'You do not have wallet access.'
            });
        }
    }, [user, router]);

    const onRefresh = useCallback(() => {
        if (user?.is_wallet_active) {
            refetch();
        }
    }, [refetch, user]);

    const handleTopUp = async (amount: number, description: string, receipt: any) => {
        try {
            await requestTopup({ amount, description, receipt }).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Request Submitted',
                text2: 'Your top-up request is pending approval.'
            });
            setModalVisible(false);
            onRefresh();
        } catch (error: any) {
            console.error(error);
        }
    };

    const transactions = useMemo(() => {
        // Ensure we always have an array, even if the API returns undefined or null
        const allTransactions = Array.isArray(walletData?.data?.transactions?.data)
            ? walletData.data.transactions.data
            : [];

        if (activeTab === 'all') return allTransactions;

        if (activeTab === 'earnings') {
            return allTransactions.filter((tx: any) => {
                const type = tx.type?.toLowerCase();
                const desc = tx.description?.toLowerCase() || '';
                // Real earnings: referral commissions, ROI, etc.
                // Exclude explicit top-ups/deposits
                if (type === 'topup' || desc.includes('topup') || desc.includes('top-up') || desc.includes('deposit')) return false;

                return type === 'referral_earning' || type === 'roi' || type === 'payout' ||
                    (type === 'credit' && (desc.includes('commission') || desc.includes('bonus') || desc.includes('earning') || desc.includes('roi')));
            });
        }

        if (activeTab === 'topups') {
            return allTransactions.filter((tx: any) => {
                const type = tx.type?.toLowerCase();
                const desc = tx.description?.toLowerCase() || '';
                return type === 'topup' || desc.includes('topup') || desc.includes('top-up') || desc.includes('deposit');
            });
        }

        if (activeTab === 'outflow') {
            return allTransactions.filter((tx: any) => {
                const type = tx.type?.toLowerCase();
                const desc = tx.description?.toLowerCase() || '';
                return type === 'debit' || type === 'withdrawal' || type === 'investment' || desc.includes('invest') || desc.includes('withdraw');
            });
        }

        return allTransactions;
    }, [walletData, activeTab]);

    const balance = useMemo(() => {
        const bal = walletData?.data?.wallet_balance;
        if (!bal) return 0;
        return parseFloat(bal.toString().replace(/[^0-9.-]/g, '')) || 0;
    }, [walletData]);

    const isWalletLoadingIndicator = isLoading || isFetching;

    if (isLoading && !walletData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.start} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Wallet</Text>
                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={onRefresh}
                >
                    <Ionicons name="time-outline" size={24} color={colors.text.primary} />
                </TouchableOpacity>
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
                {notice && (
                    <View style={styles.noticeBox}>
                        <Ionicons name="information-circle" size={20} color={colors.primary.start} />
                        <View style={styles.alertContent}>
                            <Text style={styles.noticeTitle}>Account Protection Notice</Text>
                            <Text style={styles.noticeMsg}>{notice}</Text>
                        </View>
                    </View>
                )}
                <WalletCard
                    balance={balance}
                    userName={user?.name || "User"}
                    onRefresh={onRefresh}
                />

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, !!notice && styles.disabledBtn]}
                        onPress={() => !notice && setModalVisible(true)}
                        disabled={!!notice}
                    >
                        <LinearGradient
                            colors={Gradients.secondary as [string, string, ...string[]]}
                            style={styles.actionIcon}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Top-up</Text>
                    </TouchableOpacity>
 
                    <TouchableOpacity
                        style={[styles.actionBtn, !!notice && styles.disabledBtn]}
                        onPress={() => !notice && setUserSelectionVisible(true)}
                        disabled={!!notice}
                    >
                        <LinearGradient
                            colors={['#8b5cf6', '#7c3aed'] as [string, string, ...string[]]}
                            style={styles.actionIcon}
                        >
                            <Ionicons name="send-outline" size={20} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Send/Invest</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => setWithdrawalModalVisible(true)}
                    >
                        <LinearGradient
                            colors={['#ef4444', '#dc2626'] as [string, string, ...string[]]}
                            style={styles.actionIcon}
                        >
                            <Ionicons name="download-outline" size={20} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Withdraw</Text>
                    </TouchableOpacity> */}
                </View>

                {/* Transaction Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
                        onPress={() => setActiveTab('earnings')}
                    >
                        <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
                            Earnings
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'topups' && styles.activeTab]}
                        onPress={() => setActiveTab('topups')}
                    >
                        <Text style={[styles.tabText, activeTab === 'topups' && styles.activeTabText]}>
                            Top-ups
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'outflow' && styles.activeTab]}
                        onPress={() => setActiveTab('outflow')}
                    >
                        <Text style={[styles.tabText, activeTab === 'outflow' && styles.activeTabText]}>
                            Outflow
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.transactionsHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity onPress={() => router.push('/wallet-history')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {transactions.length > 0 ? (
                    <View style={styles.listContainer}>
                        {transactions.slice(0, 5).map((tx) => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconWrapper}>
                            <Ionicons name="swap-horizontal" size={48} color={colors.text.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your wallet activity will appear here. Add money to get started.
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <TopUpModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleTopUp}
                isLoading={isSubmitting}
            />

            <WithdrawalModal
                visible={withdrawalModalVisible}
                onClose={() => setWithdrawalModalVisible(false)}
                onSuccess={onRefresh}
            />

            <UserSelectionModal
                visible={userSelectionVisible}
                onClose={() => setUserSelectionVisible(false)}
                onSelect={(user) => {
                    setSelectedUser(user);
                    setUserSelectionVisible(false);
                    setTimeout(() => setWalletActionVisible(true), 500);
                }}
            />

            <WalletActionModal
                visible={walletActionVisible}
                onClose={() => setWalletActionVisible(false)}
                referral={selectedUser}
                onSuccess={onRefresh}
            />
        </SafeAreaView>
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
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    headerTitle: {
        fontSize: FontSize.huge,
        fontWeight: 'bold',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    historyBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small, // Might need adjustment for dark mode
        borderWidth: 1,
        borderColor: colors.border,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xxl,
        paddingHorizontal: Spacing.md,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.primary,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        padding: 4,
        marginBottom: Spacing.xl,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
    activeTab: {
        backgroundColor: colors.primary.start,
    },
    tabText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    activeTabText: {
        color: '#fff',
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    seeAll: {
        fontSize: FontSize.sm,
        color: colors.primary.start,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.background.secondary, // e.g. slate100 equivalent or dark card
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
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
    alertContent: {
        flex: 1,
        marginLeft: Spacing.sm,
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
