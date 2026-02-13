import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Transfer } from '../../lib/types';
import { ImagePreviewModal } from '../common';

const BACKEND_URL = 'https://api.sarwadnyafinance.com';
const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/storage/'}${path}`;
};

interface RequestCardProps {
    request: Transfer;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [showPreview, setShowPreview] = React.useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isPending = request.status.toLowerCase() === 'pending';
    const isApproved = request.status.toLowerCase() === 'approved';
    const isRejected = request.status.toLowerCase() === 'rejected';

    const getStatusColors = () => {
        if (isApproved) return { bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7', text: isDark ? '#34d399' : '#166534', grad: ['#10b981', '#059669'] };
        if (isRejected) return { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', text: isDark ? '#f87171' : '#991b1b', grad: ['#ef4444', '#dc2626'] };
        return { bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', text: isDark ? '#fbbf24' : '#92400e', grad: ['#f59e0b', '#d97706'] };
    };

    const statusColors = getStatusColors();

    return (
        <View style={[styles.container, Shadow.small]}>
            <View style={styles.header}>
                <View style={styles.iconWrapper}>
                    <LinearGradient
                        colors={statusColors.grad as [string, string, ...string[]]}
                        style={styles.statusIcon}
                    >
                        <Ionicons
                            name={isApproved ? "checkmark-circle" : isRejected ? "close-circle" : "time"}
                            size={20}
                            color="#fff"
                        />
                    </LinearGradient>
                </View>

                <View style={styles.titleInfo}>
                    <Text style={styles.amountText}>₹{Number(request.amount).toLocaleString('en-IN')}</Text>
                    <Text style={styles.methodText}>{request.method}</Text>
                </View>

                <View style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors.bg }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: statusColors.text }
                    ]}>
                        {request.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
                    <Text style={styles.detailText}>{formatDate(request.created_at)}</Text>
                </View>

                {request.reference_id && (
                    <View style={styles.detailRow}>
                        <Ionicons name="finger-print-outline" size={14} color={colors.text.muted} />
                        <Text style={styles.detailText}>Ref: {request.reference_id}</Text>
                    </View>
                )}

                {request.notes && (
                    <View style={styles.notesBox}>
                        <Text style={styles.notesText} numberOfLines={2}>"{request.notes}"</Text>
                    </View>
                )}

                {request.receipt_image && (
                    <TouchableOpacity
                        style={styles.attachmentRow}
                        onPress={() => setShowPreview(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="attach" size={16} color={colors.primary.start} />
                        <Text style={styles.attachmentText}>View Payment Proof</Text>
                        <Ionicons name="eye-outline" size={12} color={colors.primary.start} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                )}
            </View>

            <ImagePreviewModal
                visible={showPreview}
                imageUrl={getFullUrl(request.receipt_image || "")}
                title={`Receipt: ₹${Number(request.amount).toLocaleString('en-IN')}`}
                onClose={() => setShowPreview(false)}
            />
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    iconWrapper: {
        marginRight: Spacing.md,
    },
    statusIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleInfo: {
        flex: 1,
    },
    amountText: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    methodText: {
        fontSize: 12,
        color: colors.text.muted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: Spacing.md,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    notesBox: {
        backgroundColor: colors.background.secondary,
        padding: 10,
        borderRadius: 8,
        marginTop: 4,
    },
    notesText: {
        fontSize: 11,
        color: colors.text.secondary,
        fontStyle: 'italic',
    },
    attachmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    attachmentText: {
        fontSize: 11,
        color: colors.primary.start,
        fontWeight: '600',
    }
});
