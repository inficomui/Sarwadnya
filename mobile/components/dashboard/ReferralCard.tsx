import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface ReferralCardProps {
    referralCode: string;
    referralLink?: string;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ referralCode, referralLink }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(referralCode);
        Toast.show({
            type: 'success',
            text1: 'Copied!',
            text2: 'Referral code copied to clipboard',
        });
    };

    const handleShare = async () => {
        try {
            const shareLink = referralLink || `http://shreesarwadnya.com/signup?ref=${referralCode}`;
            await Share.share({
                message: `Join Shree Sarwadnya All in one Solutions using my referral link: ${shareLink}`,
                url: shareLink, // For iOS support
                title: 'Join Shree Sarwadnya'
            }, {
                // Android dialog title
                dialogTitle: 'Share Referral Link',
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={[styles.container, Shadow.small]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="share-social" size={20} color={colors.primary.start} />
                    </View>
                    <Text style={styles.title}>Refer & Earn</Text>
                </View>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="paper-plane-outline" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.description}>
                Share your referral code with friends and earn rewards on every successful Asset.
            </Text>

            <View style={styles.codeContainer}>
                <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>Your Code</Text>
                    <Text style={styles.codeValue}>{referralCode}</Text>
                </View>
                <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                    <Ionicons name="copy-outline" size={22} color="#fff" />
                    <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        backgroundColor: colors.background.card,
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    shareButton: {
        padding: Spacing.xs,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary.start + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    description: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    codeBox: {
        flex: 1,
        backgroundColor: colors.background.secondary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    codeLabel: {
        fontSize: 10,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    codeValue: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        letterSpacing: 2,
    },
    copyButton: {
        backgroundColor: colors.primary.start,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        borderRadius: BorderRadius.md,
        ...Shadow.small,
    },
    copyText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FontSize.md,
    },
});
