import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface MenuItem {
    label: string;
    route: string;
    icon: keyof typeof Ionicons.prototype.allNames | any;
}

interface MenuSection {
    title: string;
    color: string;
    items: MenuItem[];
}

export const DashboardMenuSections = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const menuSections: MenuSection[] = [
        {
            title: "TopUp",
            color: "#dc2626", // bg-red-600
            items: [
                { label: "TopUp", route: "/growth/new", icon: "add-circle-outline" },
                { label: "TopUp Details", route: "/(tabs)/investments", icon: "list-outline" },
            ]
        },
        {
            title: "Downline",
            color: "#ea580c", // bg-orange-600
            items: [
                { label: "Direct Distributor", route: "/direct-distributor", icon: "people-outline" },
                { label: "My Network", route: "/referrals", icon: "share-social-outline" },
                { label: "Generation View", route: "/generation-view", icon: "trending-up-outline" },
            ]
        },
        {
            title: "Personal",
            color: "#c2410c", // bg-orange-700
            items: [
                { label: "Change Password", route: "/security-settings", icon: "lock-closed-outline" },
                { label: "Personal Details", route: "/personal-details", icon: "person-outline" },
                { label: "Banking Details", route: "/bank-details", icon: "business-outline" },
            ]
        },
        {
            title: "Income Details",
            color: "#312e81", // bg-indigo-900
            items: [
                { label: "Payout History", route: "/payouts", icon: "time-outline" },
                { label: "Payment Details", route: "/payout-details", icon: "cash-outline" },
                { label: "Weekly Report", route: "/weekly-report", icon: "pie-chart-outline" },
                { label: "Change TXN Password", route: "/security-settings", icon: "shield-checkmark-outline" },
            ]
        },
        {
            title: "General",
            color: "#9333ea", // bg-purple-600
            items: [
                { label: "Registration", route: "/auth/register", icon: "person-add-outline" },
                { label: "Welcome Letter", route: "/welcome-letter", icon: "document-text-outline" },
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {menuSections.map((section, idx) => (
                    <View key={idx} style={styles.card}>
                        <View style={[styles.cardHeader, { backgroundColor: section.color }]}>
                            <Text style={styles.cardTitle}>{section.title}</Text>
                        </View>
                        <View style={styles.cardContent}>
                            {section.items.map((item, itemIdx) => (
                                <TouchableOpacity
                                    key={itemIdx}
                                    style={[
                                        styles.menuItem,
                                        itemIdx < section.items.length - 1 && styles.menuItemBorder
                                    ]}
                                    onPress={() => router.push(item.route as any)}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={styles.iconContainer}>
                                            <Ionicons name={item.icon} size={18} color={colors.text.secondary} />
                                        </View>
                                        <Text style={styles.menuItemLabel}>{item.label}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    grid: {
        gap: Spacing.lg,
    },
    card: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
        marginBottom: Spacing.lg,
    },
    cardHeader: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    cardContent: {
        backgroundColor: colors.background.card,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        backgroundColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    menuItemLabel: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: colors.text.primary,
    },
});
