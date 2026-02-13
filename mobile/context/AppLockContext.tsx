import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export type LockType = 'NONE' | 'PIN' | 'PATTERN';

interface AppLockContextType {
    isLocked: boolean;
    lockType: LockType;
    isBiometricSupported: boolean;
    isBiometricsEnabled: boolean;
    unlock: () => void;
    lockApp: () => void;
    setLockSettings: (type: LockType, secret?: string) => Promise<void>;
    toggleBiometrics: (enabled: boolean) => Promise<void>;
    validateSecret: (input: string) => Promise<boolean>;
    checkBiometrics: () => Promise<boolean>;
    checkSupport: () => Promise<boolean>;
    biometricType: LocalAuthentication.AuthenticationType | null;
    supportedBiometrics: LocalAuthentication.AuthenticationType[];
    hasSkippedSetup: boolean;
    skipLockSetup: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export const AppLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [lockType, setLockType] = useState<LockType>('NONE');
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);
    const [supportedBiometrics, setSupportedBiometrics] = useState<LocalAuthentication.AuthenticationType[]>([]);
    const [hasSkippedSetup, setHasSkippedSetup] = useState(false);

    useEffect(() => {
        checkSupport();
        loadSettings();
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (lockType === 'NONE') {
            setIsBiometricsEnabled(false);
        }
    }, [lockType]);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (
            appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            checkSupport();
            if (lockType !== 'NONE') {
                setIsLocked(true);
            }
        }
        setAppState(nextAppState);
    };

    const checkSupport = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            const supported = compatible && enrolled;
            setIsBiometricSupported(supported);

            if (compatible) {
                const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

                // Filter out Face ID explicitly as per user request
                const filteredTypes = types.filter((t: LocalAuthentication.AuthenticationType) => t !== LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
                setSupportedBiometrics(filteredTypes);

                if (filteredTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                    setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
                } else if (filteredTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                    setBiometricType(LocalAuthentication.AuthenticationType.IRIS);
                } else {
                    setBiometricType(null);
                }
            }
            return supported;
        } catch (error) {
            console.log("AppLock Error - checkSupport:", error);
            setIsBiometricSupported(false);
            return false;
        }
    };

    const loadSettings = async () => {
        try {
            const savedType = await SecureStore.getItemAsync('app_lock_type');
            const savedBiometrics = await SecureStore.getItemAsync('app_lock_biometrics');
            const savedSkip = await SecureStore.getItemAsync('app_lock_skipped');

            if (savedType) {
                if (savedType === 'PIN' || savedType === 'PATTERN') {
                    setLockType(savedType as LockType);
                } else {
                    setLockType('NONE');
                }

                if (savedType !== 'NONE' && savedType !== 'BIOMETRICS') {
                    setIsLocked(true);
                }
            }

            if (savedBiometrics === 'true') {
                setIsBiometricsEnabled(true);
            }

            if (savedSkip === 'true') {
                setHasSkippedSetup(true);
            }
        } catch (error) {
            console.log("AppLock Error - loadSettings:", error);
            setLockType('NONE');
            setIsBiometricsEnabled(false);
        }
    };

    const unlock = () => {
        setIsLocked(false);
    };

    const lockApp = () => {
        if (lockType !== 'NONE') {
            setIsLocked(true);
        }
    };

    const setLockSettings = async (type: LockType, secret?: string) => {
        await SecureStore.setItemAsync('app_lock_type', type);

        if (type === 'NONE') {
            await SecureStore.deleteItemAsync('app_lock_secret');
            await SecureStore.deleteItemAsync('app_lock_biometrics');
            setIsBiometricsEnabled(false);
        } else if (secret) {
            await SecureStore.setItemAsync('app_lock_secret', secret);
        }

        setLockType(type);
    };

    const skipLockSetup = async () => {
        await SecureStore.setItemAsync('app_lock_skipped', 'true');
        setHasSkippedSetup(true);
    };

    const toggleBiometrics = async (enabled: boolean) => {
        if (enabled && !isBiometricSupported) return;

        await SecureStore.setItemAsync('app_lock_biometrics', String(enabled));
        setIsBiometricsEnabled(enabled);
    };

    const validateSecret = async (input: string) => {
        const storedSecret = await SecureStore.getItemAsync('app_lock_secret');
        return input === storedSecret;
    };

    const checkBiometrics = async () => {
        if (!isBiometricSupported) return false;

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to unlock',
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
                disableDeviceFallback: true, // We want to handle fallback ourselves
            });
            return result.success;
        } catch (e) {
            console.log("Biometric error", e);
            return false;
        }
    };

    return (
        <AppLockContext.Provider
            value={{
                isLocked,
                lockType,
                isBiometricSupported,
                isBiometricsEnabled,
                unlock,
                lockApp,
                setLockSettings,
                toggleBiometrics,
                validateSecret,
                checkBiometrics,
                checkSupport,
                biometricType,
                supportedBiometrics,
                hasSkippedSetup,
                skipLockSetup,
            }}
        >
            {children}
        </AppLockContext.Provider>
    );
};

export const useAppLock = () => {
    const context = useContext(AppLockContext);
    if (!context) {
        throw new Error('useAppLock must be used within an AppLockProvider');
    }
    return context;
};
