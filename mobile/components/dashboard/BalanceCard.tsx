import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

interface BalanceCardProps {
    totalDeposited: number;
    totalEarnings: number;
    walletBalance: number;
    rank: string;
    isWalletActive: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
    totalDeposited,
    totalEarnings,
    walletBalance,
    rank,
    isWalletActive
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <LinearGradient
            colors={[colors.primary.start, colors.primary.end]}
            style={[styles.container, Shadow.medium]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>Total Active Asset</Text>
                    <Text style={styles.value}>₹{totalDeposited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.rankContainer}>
                    <Ionicons name="trophy" size={16} color="#FFD700" />
                    <Text style={styles.rankText}>{rank || "Member"}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <View style={styles.statItem}>
                    <Text style={styles.subLabel}>Total Income</Text>
                    <Text style={styles.subValue}>₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                {isWalletActive && (
                    <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                        <Text style={styles.subLabel}>Wallet Balance</Text>
                        <Text style={styles.subValue}>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: FontSize.sm,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    value: {
        color: '#fff',
        fontSize: FontSize.huge,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    rankText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: FontSize.xs,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: Spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
    },
    subLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: FontSize.xs,
        marginBottom: 2,
    },
    subValue: {
        color: '#fff',
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
});
