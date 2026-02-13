import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { useGetTreeUsersQuery } from '../../redux/apies/treeApi';

interface UserSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (user: { id: number; name: string; email?: string }) => void;
}

export default function UserSelectionModal({ visible, onClose, onSelect }: UserSelectionModalProps) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Simple debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // We can search across levels or just use level 1 for now if global search isn't available.
    // Ideally, we'd have a specific search endpoint. For now, let's assume we search in Level 1 (Directs) 
    // or we might need to ask the user to pick a level? 
    // The DirectDistributor searches LOCALLY. 
    // Let's rely on the user searching their direct team for now as that's safe.
    // Or if the API supported 'search' param on getTreeUsers, that would be better.
    // The getTreeUsers API does NOT seem to support 'search' param in the definition I saw earlier (it was client side filtering).

    // Actually, looking at treeApi.ts:
    // getTreeUsers: builder.query... params: { page, per_page }
    // It does not accept 'search'.

    // So we will fetch Level 1 and filter locally for now.
    const { data: levelUsers, isLoading } = useGetTreeUsersQuery({
        level: 1,
        page: 1,
        per_page: 100 // Fetch more to make search effective
    });

    const filteredUsers = levelUsers?.data?.users?.data?.filter((user: any) =>
        user.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(debouncedQuery.toLowerCase()))
    ) || [];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Recipient</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or email..."
                            placeholderTextColor={colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>

                    {isLoading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator color={colors.primary.start} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No users found in your direct team.</Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.userItem}
                                    onPress={() => onSelect(item)}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{item.name.substring(0, 2).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{item.name}</Text>
                                        <Text style={styles.userEmail}>{item.email}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
            <Toast />
        </Modal>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        ...Shadow.large,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        margin: Spacing.xl,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12, // Increased touch area
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    listContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary.start,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FontSize.sm,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    userEmail: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.text.muted,
        textAlign: 'center',
    },
});
