import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { useGetWeeklyReportQuery } from '../redux/apies/payoutApi';
import { formatCurrency } from '../utils/currency';

export default function WeeklyReportScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const now = new Date();
    const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
    const [year, setYear] = useState(String(now.getFullYear()));

    const { data: reportData, isLoading, isFetching, refetch } = useGetWeeklyReportQuery({
        month,
        year
    });

    const report = reportData?.data?.report || [];

    const onRefresh = () => {
        refetch();
    };

    const months = [
        { label: 'Jan', value: '01' }, { label: 'Feb', value: '02' }, 
        { label: 'Mar', value: '03' }, { label: 'Apr', value: '04' },
        { label: 'May', value: '05' }, { label: 'Jun', value: '06' }, 
        { label: 'Jul', value: '07' }, { label: 'Aug', value: '08' },
        { label: 'Sep', value: '09' }, { label: 'Oct', value: '10' }, 
        { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Select Period</Text>
                <View style={styles.pickerRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScroll}>
                        {months.map((m) => (
                            <TouchableOpacity 
                                key={m.value} 
                                style={[styles.monthItem, month === m.value && styles.activeMonth]} 
                                onPress={() => setMonth(m.value)}
                            >
                                <Text style={[styles.monthText, month === m.value && styles.activeMonthText]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.pickerRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
                        {years.map((y) => (
                            <TouchableOpacity 
                                key={y} 
                                style={[styles.yearItem, year === y && styles.activeYear]} 
                                onPress={() => setYear(y)}
                            >
                                <Text style={[styles.yearText, year === y && styles.activeYearText]}>{y}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Performance Cycles</Text>
        </View>
    );

    const renderCycleItem = ({ item }: { item: any }) => (
        <View style={styles.cycleCard}>
            <View style={styles.cycleHeader}>
                <View>
                    <Text style={styles.cycleTitle}>Cycle {item.cycle}</Text>
                    <Text style={styles.cycleRange}>{item.range} Date Range</Text>
                </View>
                <View style={styles.cycleIconContainer}>
                    <Ionicons name="calendar-outline" size={24} color={colors.primary.start} />
                </View>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Ionicons name="trending-up" size={18} color="#f59e0b" />
                    <Text style={styles.statLabel}>SELF BONUS</Text>
                    <Text style={styles.statValue}>{formatCurrency(item.self_bonus)}</Text>
                </View>
                <View style={styles.statBox}>
                    <Ionicons name="people" size={18} color="#6366f1" />
                    <Text style={styles.statLabel}>REFERRAL</Text>
                    <Text style={styles.statValue}>{formatCurrency(item.referral_bonus)}</Text>
                </View>
            </View>

            <View style={styles.totalContainer}>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>TOTAL PAYOUT</Text>
                    <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count} Recs</Text>
                </View>
            </View>

            <View style={styles.dateFooter}>
                <Text style={styles.dateText}>{item.start_date}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                <Text style={styles.dateText}>{item.end_date}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Weekly Reports</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={20} color={colors.primary.start} />
                </TouchableOpacity>
            </View>

            {isLoading && !isFetching ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.start} />
                </View>
            ) : (
                <FlatList
                    data={report}
                    renderItem={renderCycleItem}
                    keyExtractor={(item) => item.cycle.toString()}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={onRefresh}
                            colors={[colors.primary.start]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bar-chart-outline" size={64} color={colors.text.muted} />
                            <Text style={styles.emptyText}>No performance data found for this period</Text>
                        </View>
                    }
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
    },
    navTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    refreshButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    listContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    filterSection: {
        backgroundColor: colors.background.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    filterLabel: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
    },
    pickerRow: {
        marginBottom: Spacing.sm,
    },
    monthScroll: {
        paddingBottom: 4,
    },
    monthItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        marginRight: 8,
        backgroundColor: colors.background.primary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeMonth: {
        backgroundColor: colors.primary.start,
        borderColor: colors.primary.start,
    },
    monthText: {
        fontSize: FontSize.sm,
        color: colors.text.primary,
        fontWeight: '600',
    },
    activeMonthText: {
        color: '#FFFFFF',
    },
    yearScroll: {
        paddingVertical: 4,
    },
    yearItem: {
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        marginRight: 8,
        backgroundColor: colors.background.primary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeYear: {
        borderColor: colors.primary.start,
    },
    yearText: {
        fontSize: FontSize.sm,
        color: colors.text.primary,
        fontWeight: '600',
    },
    activeYearText: {
        color: colors.primary.start,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    cycleCard: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
        ...Shadow.medium,
        borderTopWidth: 4,
        borderTopColor: colors.primary.start + '40',
    },
    cycleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: colors.primary.start + '08',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cycleTitle: {
        fontSize: FontSize.lg,
        fontWeight: '900',
        color: colors.text.primary,
    },
    cycleRange: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary.start,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cycleIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
    },
    statsGrid: {
        flexDirection: 'row',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    statBox: {
        flex: 1,
        padding: Spacing.md,
        backgroundColor: colors.background.primary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginTop: 4,
    },
    statValue: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: 2,
    },
    totalContainer: {
        marginHorizontal: Spacing.lg,
        padding: Spacing.lg,
        backgroundColor: '#0f172a',
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalInfo: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    totalValue: {
        fontSize: FontSize.xl,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    countBadge: {
        backgroundColor: colors.primary.start,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
    },
    countText: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: '#FFFFFF',
        fontStyle: 'italic',
    },
    dateFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        marginTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    dateText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text.muted,
        backgroundColor: colors.background.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: Spacing.lg,
        fontSize: FontSize.md,
        color: colors.text.muted,
        textAlign: 'center',
        fontWeight: '500',
    },
});
