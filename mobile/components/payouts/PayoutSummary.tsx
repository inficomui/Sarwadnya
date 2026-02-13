import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/currency';

interface PayoutSummaryProps {
    totalEarnings: number;
    totalRoi: number;
    totalReferral: number;
}

export const PayoutSummary: React.FC<PayoutSummaryProps> = ({
    totalEarnings,
    totalRoi,
    totalReferral
}) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    return (
        <LinearGradient
            colors={[colors.primary.start, colors.primary.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Payouts</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalEarnings)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownContainer}>
                <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>ROI Income</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(totalRoi)}</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Referral Bonus</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(totalReferral)}</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        ...Shadow.medium,
    },
    totalSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    totalLabel: {
        fontSize: FontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: Spacing.lg,
    },
    breakdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    breakdownItem: {
        flex: 1,
        alignItems: 'center',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    breakdownLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    breakdownValue: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: '#fff',
    },
});
