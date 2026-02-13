import { addScreenshotListener, usePreventScreenCapture } from 'expo-screen-capture';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';


export const ScreenProtection = () => {
    usePreventScreenCapture();

    useEffect(() => {
        const subscription = addScreenshotListener(() => {
            Toast.show({
                type: 'error',
                text1: 'Security Restriction',
                text2: 'Screenshots are prohibited to protect your financial data.',
                position: 'bottom',
                visibilityTime: 4000,
            });
        });
        return () => subscription.remove();
    }, []);

    return null;
};
