import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetInvestmentScheduleQuery } from '../../redux/apies/investmentApi';
import { Colors, Spacing, FontSize, Shadow, BorderRadius } from '../../constants/Theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { InvestmentScheduleItem } from '../../lib/types';

export default function AssetDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data, isLoading } = useGetInvestmentScheduleQuery(Number(id));

    const investment = data?.data?.investment;
    const schedule = data?.data?.schedule || [];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'active':
            case 'paid':
                return Colors.status.success;
            case 'pending':
            case 'processing':
                return Colors.status.warning;
            case 'rejected':
                return Colors.status.error;
            default:
                return Colors.text.muted;
        }
    };

    const renderHeader = () => {
        if (!investment) return null;

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.mainInfo}>
                    <View>
                        <Text style={styles.label}>Investment Amount</Text>
                        <Text style={styles.amount}>{formatCurrency(Number(investment.amount))}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(investment.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(investment.status) }]}>
                            {investment.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Monthly ROI</Text>
                        <Text style={styles.statValue}>{investment.roi_percentage || '5'}%</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Duration</Text>
                        <Text style={styles.statValue}>{investment.total_months || '20'} Months</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Start Date</Text>
                        <Text style={styles.statValue}>{formatDate(investment.created_at)}</Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>
                            {investment.paid_months || 0} / {investment.total_months || 20} Months
                        </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${((investment.paid_months || 0) / (investment.total_months || 20)) * 100}%` }
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    };

    const renderItem = ({ item }: { item: InvestmentScheduleItem }) => {
        const isPaid = item.status === 'Paid';
        const isUnmatured = item.status === 'Unmatured';

        return (
            <View style={[styles.itemCard, isUnmatured && styles.itemUnmatured]}>
                <View style={styles.itemLeft}>
                    <View style={[styles.monthBadge, isPaid ? styles.monthPaid : (isUnmatured ? styles.monthUnmatured : styles.monthProcessing)]}>
                        <Text style={[styles.monthText, isPaid ? styles.textPaid : (isUnmatured ? styles.textUnmatured : styles.textProcessing)]}>
                            #{item.installment_no}
                        </Text>
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.payoutDate}>{formatDate(item.payout_date)}</Text>
                        <Text style={styles.payoutStatus}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.itemAmount, isPaid ? styles.amountPaid : styles.amountPending]}>
                    {formatCurrency(Number(item.amount))}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Asset Details</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary.start} />
                </View>
            ) : investment ? (
                <FlatList
                    data={schedule}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponentStyle={{ marginBottom: Spacing.xl }}
                />
            ) : (
                <View style={styles.center}>
                    <Text style={styles.errorText}>Investment not found</Text>
                </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl * 2,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        ...Shadow.medium,
    },
    mainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.xs,
        color: Colors.text.muted,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    amount: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: Spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.text.muted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    progressSection: {
        gap: 8,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    progressValue: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: Colors.primary.start,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary.start,
        borderRadius: 4,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        ...Shadow.small,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary.start,
    },
    itemUnmatured: {
        opacity: 0.7,
        borderLeftColor: Colors.text.muted,
        backgroundColor: '#f8fafc',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    monthBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthPaid: {
        backgroundColor: Colors.status.success + '15',
    },
    monthProcessing: {
        backgroundColor: Colors.status.warning + '15',
    },
    monthUnmatured: {
        backgroundColor: Colors.text.muted + '15',
    },
    monthText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    textPaid: { color: Colors.status.success },
    textProcessing: { color: Colors.status.warning },
    textUnmatured: { color: Colors.text.muted },
    itemContent: {
        justifyContent: 'center',
    },
    payoutDate: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    payoutStatus: {
        fontSize: 10,
        color: Colors.text.muted,
    },
    itemAmount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    amountPaid: {
        color: Colors.status.success,
    },
    amountPending: {
        color: Colors.text.muted,
    },
    errorText: {
        fontSize: FontSize.md,
        color: Colors.status.error,
    },
});

