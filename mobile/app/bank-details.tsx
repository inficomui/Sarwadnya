import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { useAddBankDetailMutation, useDeleteBankDetailMutation, useGetBankDetailsQuery, useUpdateBankDetailMutation } from '../redux/apies/paymentApi';

export default function BankDetailsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { data: bankResponse, isLoading } = useGetBankDetailsQuery();
    const [addBankDetail, { isLoading: isAdding }] = useAddBankDetailMutation();
    const [updateBankDetail, { isLoading: isUpdating }] = useUpdateBankDetailMutation();
    const [deleteBankDetail] = useDeleteBankDetailMutation();

    const [bankName, setBankName] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [branchName, setBranchName] = useState('');

    const bankDetails = bankResponse?.data || [];

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleAddBank = async () => {
        if (!bankName || !accountHolder || !accountNumber || !ifscCode) {
            Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
            return;
        }

        try {
            await addBankDetail({
                bank_name: bankName,
                account_holder_name: accountHolder,
                account_number: accountNumber,
                ifsc_code: ifscCode,
                branch_name: branchName
            }).unwrap();

            setBankName('');
            setAccountHolder('');
            setAccountNumber('');
            setIfscCode('');
            setBranchName('');

        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Bank Account",
            "Are you sure you want to remove this bank account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteBankDetail(id).unwrap();

                        } catch (e) { console.error(e); }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bank Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Existing Bank Accounts */}
                <Text style={styles.sectionTitle}>Your Accounts</Text>
                {isLoading ? (
                    <ActivityIndicator color={colors.primary.start} style={{ margin: 20 }} />
                ) : bankDetails.length > 0 ? (
                    bankDetails.map((bank: any) => (
                        <View key={bank.id} style={[styles.bankCard, Shadow.small, bank.is_primary && styles.primaryBankCard]}>
                            {bank.is_primary ? (
                                <View style={styles.primaryBadge}>
                                    <Text style={styles.primaryBadgeText}>Primary</Text>
                                </View>
                            ) : null}
                            <View style={styles.bankHeader}>
                                <View style={styles.bankIconWrapper}>
                                    <Ionicons name="business" size={24} color={colors.primary.start} />
                                </View>
                                <View style={styles.bankInfo}>
                                    <Text style={styles.bankName}>{bank.bank_name}</Text>
                                    <Text style={styles.accNumber}>•••• •••• {bank.account_number.slice(-4)}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(bank.id)}>
                                    <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.bankFooter}>
                                <Text style={styles.holderName}>{bank.account_holder_name}</Text>
                                <Text style={styles.ifscCode}>IFSC: {bank.ifsc_code}</Text>
                            </View>

                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={48} color={colors.text.muted} />
                        <Text style={styles.emptyText}>No bank details added yet</Text>
                    </View>
                )}

                {/* Add New Bank Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Add New Account</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bank Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. HDFC Bank"
                            placeholderTextColor={colors.text.muted}
                            value={bankName}
                            onChangeText={setBankName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account Holder Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="As per bank records"
                            placeholderTextColor={colors.text.muted}
                            value={accountHolder}
                            onChangeText={setAccountHolder}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter account number"
                            placeholderTextColor={colors.text.muted}
                            keyboardType="numeric"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>IFSC Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. HDFC0001234"
                            placeholderTextColor={colors.text.muted}
                            autoCapitalize="characters"
                            value={ifscCode}
                            onChangeText={setIfscCode}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Branch Name (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter branch name"
                            placeholderTextColor={colors.text.muted}
                            value={branchName}
                            onChangeText={setBranchName}
                        />
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={handleAddBank} disabled={isAdding}>
                        <LinearGradient colors={Gradients.primary as [string, string, ...string[]]} style={styles.addGradient}>
                            {isAdding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addText}>Add Bank Account</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    bankCard: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    bankIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary.start + '10', // Or use colors.iconBg.blue
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    bankInfo: {
        flex: 1,
    },
    bankName: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    accNumber: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
    },
    bankFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    holderName: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: colors.text.primary,
    },
    ifscCode: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxl,
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 10,
        color: colors.text.muted,
        fontSize: FontSize.sm,
    },
    formContainer: {
        marginTop: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    addButton: {
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    addGradient: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    primaryBankCard: {
        borderColor: colors.primary.start,
        borderWidth: 2,
    },
    primaryBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.primary.start,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderBottomLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.xl,
        zIndex: 1,
    },
    primaryBadgeText: {
        color: '#fff',
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    setPrimaryButton: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    setPrimaryText: {
        color: colors.primary.start,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.text.muted,
        marginRight: Spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary.start,
        borderColor: colors.primary.start,
    },
    checkboxLabel: {
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
});
