import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

interface ActionItem {
    label: string;
    icon: keyof typeof Ionicons.prototype.allNames | any;
    color: string;
    bgColor: string;
    route: string;
}

interface QuickActionsProps {
    isWalletActive: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ isWalletActive }) => {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const actions: ActionItem[] = [
        {
            label: 'New Asset',
            icon: 'add-circle-outline',
            color: colors.icon.green,
            bgColor: colors.iconBg.green,
            route: '/growth/new',
        },
        ...(isWalletActive ? [{
            label: 'Wallet',
            icon: 'wallet-outline',
            color: colors.icon.blue,
            bgColor: colors.iconBg.blue,
            route: '/(tabs)/wallet',
        }] : []),
        {
            label: 'Network',
            icon: 'people-outline',
            color: colors.icon.purple,
            bgColor: colors.iconBg.purple,
            route: '/team',
        },
        {
            label: 'Earnings',
            icon: 'stats-chart-outline',
            color: colors.icon.yellow,
            bgColor: colors.iconBg.yellow,
            route: '/payouts',
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quick Actions</Text>
            <View style={styles.grid}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionItem}
                        onPress={() => router.push(action.route as any)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                            <Ionicons name={action.icon} size={26} color={action.color} />
                        </View>
                        <Text style={styles.label}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    actionItem: {
        alignItems: 'center',
        width: (width - Spacing.xl * 2 - Spacing.md * 3) / 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        ...Shadow.small,
    },
    label: {
        fontSize: FontSize.xs,
        color: colors.text.secondary,
        fontWeight: '600',
        textAlign: 'center',
    },
});
