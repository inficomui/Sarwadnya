import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

export type AssetTabType = 'Active' | 'Completed' | 'Requests' | 'All';

interface AssetTabsProps {
    activeTab: AssetTabType;
    onTabChange: (tab: AssetTabType) => void;
}

export const AssetTabs: React.FC<AssetTabsProps> = ({ activeTab, onTabChange }) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const tabs: AssetTabType[] = ['Active', 'Completed', 'Requests', 'All'];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        activeTab === tab && styles.activeTab
                    ]}
                    onPress={() => onTabChange(tab)}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText
                    ]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        padding: 4,
        borderRadius: 14,
        marginBottom: Spacing.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: isDark ? colors.background.primary : '#fff',
        ...Shadow.small,
    },
    tabText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    activeTabText: {
        color: colors.primary.start,
        fontWeight: 'bold',
    }
});
