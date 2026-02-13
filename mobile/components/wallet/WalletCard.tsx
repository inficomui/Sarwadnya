import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface WalletCardProps {
    balance: number;
    userName: string;
    onRefresh: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, userName, onRefresh }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <LinearGradient
            colors={[colors.primary.start, colors.primary.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, Shadow.medium]}
        >
            <View style={styles.header}>
                <Text style={styles.label}>Total Balance</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <Text style={styles.balance}>
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>

            <View style={styles.footer}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{(userName || 'U').charAt(0)}</Text>
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.statusText}>Active</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xxl,
        marginBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    label: {
        fontSize: FontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    refreshBtn: {
        padding: 4,
    },
    balance: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: Spacing.xl,
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    avatarPlaceholder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: FontSize.sm,
        color: '#fff',
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4ade80',
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
