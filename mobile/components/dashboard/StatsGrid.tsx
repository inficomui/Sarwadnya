import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface StatsGridProps {
    directTeam: number;
    totalTeam: number;
    totalPayouts?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
    directTeam,
    totalTeam,
    totalPayouts
}) => {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const stats = [
        {
            title: 'Direct Partners',
            value: directTeam,
            icon: 'people',
            color: colors.icon.blue,
            route: '/team',
            params: { level: 1 }
        },
        {
            title: 'Total Team',
            value: totalTeam,
            icon: 'layers',
            color: colors.icon.purple,
            route: '/team',
            params: {}
        }
    ];

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.statCard, Shadow.small]}
                    onPress={() => router.push({ pathname: stat.route as any, params: stat.params })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
                        <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.label}>{stat.title}</Text>
                        <Text style={styles.value}>{stat.value}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    label: {
        color: colors.text.secondary,
        fontSize: FontSize.xs,
        fontWeight: '500',
        marginBottom: 2,
    },
    value: {
        color: colors.text.primary,
        fontSize: FontSize.xl,
        fontWeight: 'bold',
    },
});
