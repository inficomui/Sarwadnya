import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Payout } from '../../lib/types';

interface PayoutCardProps {
    payout: Payout;
    onViewSlip?: (payout: Payout) => void;
}

export const PayoutCard: React.FC<PayoutCardProps> = ({ payout, onViewSlip }) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const isRoi = payout.type === 'roi';
    const statusColor = payout.status === 'processed' || payout.status === 'paid'
        ? colors.status.success
        : payout.status === 'pending'
            ? colors.status.warning
            : colors.status.error;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: isRoi ? colors.primary.start + '15' : colors.secondary.start + '15' }]}>
                    <Ionicons
                        name={isRoi ? "trending-up" : "people"}
                        size={20}
                        color={isRoi ? colors.primary.start : colors.secondary.start}
                    />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.type}>
                        {isRoi ? 'ROI Earnings' : 'Referral Bonus'}
                    </Text>
                    <Text style={styles.date}>{formatDate(payout.payout_date)}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.amount}>{formatCurrency(Number(payout.amount))}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {payout.status?.toUpperCase() || 'PAID'}
                        </Text>
                    </View>
                </View>
            </View>

            {(payout.tds || payout.admin_charges) && (
                <View style={styles.details}>
                    {Number(payout.tds) > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>TDS (5%)</Text>
                            <Text style={styles.value}>-{formatCurrency(Number(payout.tds))}</Text>
                        </View>
                    )}
                    {Number(payout.admin_charges) > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Admin (5%)</Text>
                            <Text style={styles.value}>-{formatCurrency(Number(payout.admin_charges))}</Text>
                        </View>
                    )}
                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Net Credited</Text>
                        <Text style={styles.totalValue}>{formatCurrency(Number(payout.net_amount || payout.amount))}</Text>
                    </View>
                </View>
            )}
            
            {onViewSlip && payout.status?.toLowerCase() !== 'unmatured' && (
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={[styles.viewSlipBtn, { backgroundColor: colors.primary.start + '15' }]} 
                        onPress={() => onViewSlip(payout)}
                    >
                        <Text style={[styles.viewSlipText, { color: colors.primary.start }]}>VIEW PAYSLIP</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    headerContent: {
        flex: 1,
    },
    type: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 2,
    },
    date: {
        fontSize: 10,
        color: colors.text.muted,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.status.success,
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    details: {
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 11,
        color: colors.text.muted,
    },
    value: {
        fontSize: 11,
        color: colors.status.error,
    },
    totalRow: {
        marginTop: 4,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.status.success,
    },
    actionContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderStyle: 'dashed',
    },
    viewSlipBtn: {
        paddingVertical: 10,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewSlipText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
