import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGetUserDashboardQuery } from '../../redux/apies/dashboardApi';
import { useCreateTransferMutation, useGetMyTransfersQuery } from '../../redux/apies/transferApi';
import { useGetWalletQuery, useInvestFromWalletMutation } from '../../redux/apies/walletApi';

// Modular Components
import { AssetForm } from '../../components/growth/AssetForm';

export default function NewAssetScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Fetch wallet and dashboard data
    const { data: walletData, refetch: refetchWallet } = useGetWalletQuery();
    const { data: dashboardData, refetch: refetchDashboard } = useGetUserDashboardQuery();
    const { data: transfersData, refetch: refetchTransfers } = useGetMyTransfersQuery();

    // Mutations
    const [investFromWallet, { isLoading: isInvestingWallet }] = useInvestFromWalletMutation();
    const [createTransfer, { isLoading: isCreatingTransfer }] = useCreateTransferMutation();

    const walletBalance = useMemo(() => {
        const bal = walletData?.data?.wallet_balance;
        if (!bal) return 0;
        return parseFloat(bal.toString().replace(/[^0-9.-]/g, '')) || 0;
    }, [walletData]);

    const isWalletActive = dashboardData?.data?.account?.is_wallet_active ?? false;
    const isLoading = isInvestingWallet || isCreatingTransfer;
    const history = transfersData?.data?.transfers || [];

    const handleFormSubmit = async (formData: any, method: string) => {
        try {
            if (method === 'Wallet') {
                // Handle wallet investment
                await investFromWallet({
                    user_id: user!.id,
                    amount: formData.amount,
                    total_months: formData.total_months || 20
                }).unwrap();

                Toast.show({
                    type: 'success',
                    text1: 'Success!',
                    text2: 'Investment from wallet created successfully.'
                });
            } else {
                // Handle external payment investment request
                await createTransfer(formData).unwrap();

                Toast.show({
                    type: 'success',
                    text1: 'Request Submitted!',
                    text2: 'Your investment request is pending approval.'
                });
            }

            // Common cleanup
            refetchDashboard();
            refetchWallet();
            refetchTransfers();
            router.replace({ pathname: '/(tabs)/investments' as any });
        } catch (error: any) {
            console.error("Investment Error:", error);
            const msg = error?.data?.message || "Failed to process investment. Please try again.";
            Toast.show({
                type: 'error',
                text1: 'Investment Failed',
                text2: msg
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>New Investment</Text>
                    <Text style={styles.headerSubtitle}>Choose your wealth path</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <AssetForm
                    walletBalance={walletBalance}
                    isWalletActive={isWalletActive}
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                    history={history}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 10,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: 120, // Increased from 40 to ensure the Submit button clears the tab bar
    },
    disclaimer: {
        marginTop: Spacing.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        gap: 8,
    },
    disclaimerText: {
        fontSize: 10,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 14,
    },
});
