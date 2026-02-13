import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface TransactionItemProps {
    transaction: {
        id: string | number;
        description: string;
        amount: string | number;
        type: 'credit' | 'debit';
        status: string;
        created_at: string;
    };
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const isCredit = transaction.type === 'credit';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        }) + ', ' + date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return colors.status.success;
            case 'pending': return colors.status.warning;
            case 'failed': return colors.status.error;
            default: return colors.text.secondary;
        }
    };

    return (
        <View style={[styles.container, Shadow.small]}>
            <View style={[
                styles.iconWrapper,
                { backgroundColor: isCredit ? colors.status.success + '15' : colors.status.error + '15' }
            ]}>
                <Ionicons
                    name={isCredit ? "arrow-down" : "arrow-up"}
                    size={22}
                    color={isCredit ? colors.status.success : colors.status.error}
                />
            </View>

            <View style={styles.details}>
                <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
                <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
            </View>

            <View style={styles.amountSection}>
                <Text style={[
                    styles.amount,
                    { color: isCredit ? colors.status.success : colors.status.error }
                ]}>
                    {isCredit ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(transaction.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                        {transaction.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    details: {
        flex: 1,
    },
    description: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    date: {
        fontSize: 11,
        color: colors.text.muted,
    },
    amountSection: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
