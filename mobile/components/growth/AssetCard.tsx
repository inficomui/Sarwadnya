import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Investment as Asset } from '../../lib/types';

interface AssetCardProps {
    Asset: Asset;
    onPress: (id: string | number) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ Asset, onPress }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const progress = Asset.total_months && Asset.paid_months
        ? (Asset.paid_months / Asset.total_months) * 100
        : 0;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isStatusActive = Asset.status.toLowerCase() === 'active';

    return (
        <TouchableOpacity
            style={[styles.container, Shadow.small]}
            onPress={() => onPress(Asset.id)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <LinearGradient
                    colors={[colors.primary.start, colors.primary.end]}
                    style={styles.iconWrapper}
                >
                    <Ionicons name="trending-up" size={22} color="#fff" />
                </LinearGradient>
            </View>

            <View style={styles.details}>
                <View style={styles.headerRow}>
                    <Text style={styles.idText}>Asset #{Asset.id}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isStatusActive ? colors.status.success + '20' : colors.background.secondary }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: isStatusActive ? colors.status.success : colors.text.secondary }
                        ]}>
                            {Asset.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={styles.dateText}>Started: {formatDate(Asset.created_at)}</Text>

                <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                        <Ionicons name="card-outline" size={12} color={colors.text.muted} />
                        <Text style={styles.metaValue}>{Asset.method || 'Allocated'}</Text>
                    </View>
                    {Asset.reference_id && (
                        <View style={styles.metaItem}>
                            <Ionicons name="finger-print-outline" size={12} color={colors.text.muted} />
                            <Text style={styles.metaValue} numberOfLines={1}>{Asset.reference_id}</Text>
                        </View>
                    )}
                </View>

                {Asset.total_months ? (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <View style={styles.progressLabelRow}>
                            <Text style={styles.progressText}>
                                {Asset.paid_months}/{Asset.total_months} Months
                            </Text>
                            <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderSpace} />
                )}
            </View>

            <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountValue}>₹{Number(Asset.amount).toLocaleString('en-IN')}</Text>
                {Asset.roi_percentage && (
                    <View style={styles.roiBadge}>
                        <Text style={styles.roiText}>{Asset.roi_percentage}% ROI</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        marginRight: Spacing.md,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    idText: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
        marginBottom: Spacing.md,
    },
    progressContainer: {
        marginTop: 4,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.background.secondary,
        borderRadius: 3,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary.start,
        borderRadius: 3,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 10,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    percentageText: {
        fontSize: 10,
        color: colors.primary.start,
        fontWeight: 'bold',
    },
    amountSection: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        marginLeft: Spacing.sm,
    },
    amountLabel: {
        fontSize: 10,
        color: colors.text.muted,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    amountValue: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 6,
    },
    roiBadge: {
        backgroundColor: colors.status.success + '10',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    roiText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.status.success,
    },
    placeholderSpace: {
        height: 20,
    },
    metaGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginVertical: Spacing.sm,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.background.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    metaValue: {
        fontSize: 10,
        color: colors.text.secondary,
        fontWeight: '500',
    },
});
