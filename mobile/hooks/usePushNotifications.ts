import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useUpdateDeviceTokenMutation } from '../redux/apies/authApi';
import Constants from 'expo-constants';

// Only initialize notification handler if not in Expo Go
if (Constants.appOwnership !== 'expo') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
    });
}

export const usePushNotifications = (userId?: number) => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    const [updateDeviceToken] = useUpdateDeviceTokenMutation();

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        // Skip Push Notification setup in Expo Go
        if (Constants.appOwnership === 'expo') {
            console.log('Push Notifications are not supported in Expo Go. Skipping registration.');
            return;
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    console.log('Project ID not found');
                }
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: projectId,
                });
                token = tokenData.data;
                console.log('Expo Push Token (Synced):', token);
            } catch (error) {
                console.log('Error fetching push token:', error);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {
        let isMounted = true;

        registerForPushNotificationsAsync().then(token => {
            if (isMounted) {
                setExpoPushToken(token);
                if (token && userId) {
                    // Send to backend only if user is logged in
                    updateDeviceToken({
                        token: token,
                        platform: Platform.OS
                    }).unwrap()
                        .then(() => console.log('Device token synced with backend for user', userId))
                        .catch(err => console.error("Failed to sync token", err));
                }
            }
        });

        if (Constants.appOwnership !== 'expo') {
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setNotification(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Notification response:', response);
            });
        }

        return () => {
            isMounted = false;
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [userId]); // Re-run when userId changes (e.g. login)

    return {
        expoPushToken,
        notification
    };
}
