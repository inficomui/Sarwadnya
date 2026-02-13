import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout as logoutAction } from '../redux/slices/authSlice';
import type { User } from '../lib/types';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((state: any) => state.auth.user);
    const router = useRouter();
    const segments = useSegments();
    const dispatch = useDispatch();

    // Initialize notification handling
    usePushNotifications(user?.id);

    useEffect(() => {
        // Check for persisted user data
        const bootstrapAsync = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const token = await AsyncStorage.getItem('token');

                if (userJson && token) {
                    const userData = JSON.parse(userJson);
                    dispatch(setCredentials({ user: userData, token }));
                }
            } catch (e) {
                console.error('Failed to load user', e);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAsync();
    }, [dispatch]);

    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (isLoading || !navigationState?.key) return;

        const inAuthGroup = segments[0] === 'auth';

        // If not authenticated and not in auth group, redirect to login
        // but allow splash screen
        if (!user && !inAuthGroup && (segments[0] as string) !== 'splash') {
            router.replace('/auth/login');
        }

        // If authenticated and in auth group, redirect to home
        if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, segments, isLoading, navigationState?.key]);

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('tokenType');
        dispatch(logoutAction());
        router.replace('/auth/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
