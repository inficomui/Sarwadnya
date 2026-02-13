import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface AssetSummaryProps {
    totalAllocated: number;
    activeCount: number;
    completedCount: number;
}

export const AssetSummary: React.FC<AssetSummaryProps> = ({
    totalAllocated,
    activeCount,
    completedCount
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary.start, colors.primary.end]}
                style={[styles.mainCard, Shadow.medium]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.label}>Total Amount Allocated</Text>
                <Text style={styles.value}>₹{totalAllocated.toLocaleString('en-IN')}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Active</Text>
                        <Text style={styles.statValue}>{activeCount}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Completed</Text>
                        <Text style={styles.statValue}>{completedCount}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    mainCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
    },
    label: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        fontWeight: '500',
    },
    value: {
        fontSize: FontSize.huge,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: Spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    statValue: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: '#fff',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    }
});
