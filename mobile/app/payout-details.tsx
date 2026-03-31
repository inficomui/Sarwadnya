import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayoutSlipModal } from '../components/payouts/PayoutSlipModal';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { Payout } from '../lib/types';
import { useGetPayoutsByRangeQuery } from '../redux/apies/payoutApi';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export default function PayoutDetailsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(true);

    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [isSlipOpen, setIsSlipOpen] = useState(false);

    const { data: payoutsData, isLoading, isFetching, refetch } = useGetPayoutsByRangeQuery(
        {
            start_date: startDate || '',
            end_date: endDate || '',
        },
        {
            skip: !searchTriggered,
            refetchOnMountOrArgChange: false,
        }
    );

    const handleSearch = () => {
        if (startDate && endDate) {
            setSearchTriggered(true);
            refetch();
        } else if (!startDate && !endDate) {
            setSearchTriggered(true);
            refetch();
        }
    };

    const payoutsList = payoutsData?.data || [];

    const handleViewSlip = (payout: Payout) => {
        setSelectedPayout(payout);
        setIsSlipOpen(true);
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        const isActive = status?.toLowerCase() === 'paid' || status?.toLowerCase() === 'processed';
        const isPending = status?.toLowerCase() === 'pending';
        return (
            <View style={[
                styles.statusBadge,
                { backgroundColor: isActive ? colors.status.success + '15' : isPending ? colors.status.warning + '15' : colors.status.error + '15', alignSelf: 'flex-start' }
            ]}>
                <Text style={[
                    styles.statusBadgeText,
                    { color: isActive ? colors.status.success : isPending ? colors.status.warning : colors.status.error }
                ]}>
                    {status || 'PENDING'}
                </Text>
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: Payout, index: number }) => {
        const grossAmount = Number(item.amount);
        const tds = Number(item.tds || 0);
        const adminCharges = Number(item.admin_charges || 0);
        const netAmount = Number(item.net_amount || (grossAmount - tds - adminCharges));

        return (
            <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 50, fontWeight: 'bold' }]}>{index + 1}</Text>
                <View style={{ width: 100, justifyContent: 'center' }}>
                    <View style={[styles.typeBadge, { backgroundColor: item.type === 'roi' ? colors.primary.start + '15' : colors.secondary.start + '15', alignSelf: 'flex-start' }]}>
                        <Text style={[styles.typeText, { color: item.type === 'roi' ? colors.primary.start : colors.secondary.start }]}>
                            {item.type === 'roi' ? 'Self Bonus' : 'Level'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.tableCell, { width: 80, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>#{item.id}</Text>
                <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.payout_date || item.created_at)}</Text>
                <Text style={[styles.tableCell, { width: 100, fontWeight: 'bold' }]}>{formatCurrency(grossAmount)}</Text>
                <Text style={[styles.tableCell, { width: 100, color: colors.status.error }]}>-{formatCurrency(tds + adminCharges)}</Text>
                <Text style={[styles.tableCell, { width: 100, color: colors.status.success, fontWeight: 'bold' }]}>{formatCurrency(netAmount)}</Text>
                <View style={{ width: 100, justifyContent: 'center' }}>
                    <StatusBadge status={item.status} />
                </View>
                <View style={{ width: 80, justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={styles.tableActionButton}
                        onPress={() => handleViewSlip(item)}
                        disabled={item.status?.toLowerCase() === 'unmatured'}
                    >
                        <Text style={styles.tableActionText}>VIEW SLIP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Payout Statement</Text>
                    <Text style={styles.headerSubtitle}>Detailed tracking of financial growth</Text>
                </View>
                <TouchableOpacity onPress={() => refetch()} style={styles.backButton}>
                    <Ionicons name="refresh" size={20} color={colors.primary.start} />
                </TouchableOpacity>
            </View>

            {/* Filter Section */}
            <View style={styles.filterContainer}>
                <View style={styles.dateInputsCard}>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.dateLabel}>STATISTICAL PERIOD START</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar-outline" size={16} color={colors.text.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.text.muted}
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                        </View>
                    </View>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.dateLabel}>STATISTICAL PERIOD END</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar-outline" size={16} color={colors.text.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.text.muted}
                                value={endDate}
                                onChangeText={setEndDate}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.fetchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={18} color="#fff" />
                        <Text style={styles.fetchButtonText}>FETCH DATA</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading || isFetching ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.start} />
                    <Text style={styles.loadingText}>Generating Financial Data...</Text>
                </View>
            ) : (
                <View style={styles.tableWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.tableContainer}>
                            {/* Table Header */}
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, { width: 50 }]}>Sr.</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Type</Text>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>No.</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Date</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Gross</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Deductions</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Net Amt</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Status</Text>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Action</Text>
                            </View>

                            {/* Table Body */}
                            <FlatList
                                data={payoutsList}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderItem}
                                contentContainerStyle={payoutsList.length === 0 ? { flex: 1, minWidth: 810 } : undefined}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="search" size={48} color={colors.text.muted} />
                                        <Text style={styles.emptyTitle}>No Payouts Found</Text>
                                        <Text style={styles.emptySubtitle}>Try adjusting your date range</Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>
                </View>
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
        marginTop: 2,
    },
    filterContainer: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    dateInputsCard: {
        backgroundColor: colors.background.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateInputWrapper: {
        marginBottom: Spacing.md,
    },
    dateLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginBottom: 4,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.md,
        height: 44,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        color: colors.text.primary,
        fontSize: FontSize.sm,
        height: '100%',
    },
    fetchButton: {
        backgroundColor: colors.primary.start,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
    },
    fetchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FontSize.sm,
        marginLeft: Spacing.xs,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        color: colors.text.muted,
        fontSize: FontSize.sm,
    },
    listContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    tableWrapper: {
        flex: 1,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.xxl,
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
        overflow: 'hidden',
    },
    tableContainer: {
        minWidth: 810,
        backgroundColor: colors.background.card,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#2D2412' : '#F8F6F0',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    tableHeaderCell: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: isDark ? colors.primary.start : '#B8860B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: colors.background.card,
    },
    tableCell: {
        fontSize: FontSize.xs,
        color: colors.text.primary,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tableActionButton: {
        backgroundColor: colors.primary.start + '10',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary.start + '30',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableActionText: {
        color: colors.primary.start,
        fontSize: 9,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
        width: 810, // Match minimum container width
    },
    emptyTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.muted,
        marginTop: 4,
    },
});
