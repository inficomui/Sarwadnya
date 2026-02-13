import { Stack } from "expo-router";
import { usePreventScreenCapture } from 'expo-screen-capture';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from "react-redux";
import { LockScreen } from "../components/AppLock/LockScreen";
import { AppLockProvider } from "../context/AppLockContext";
import { AuthProvider } from "../context/AuthContext";
import reduxStore from "../redux/store";

import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  usePreventScreenCapture();

  return (
    <Provider store={reduxStore}>
      <AuthProvider>
        <AppLockProvider>
          <ThemeProvider>
            <SafeAreaProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="splash" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="growth" />
                <Stack.Screen name="kyc" />
                <Stack.Screen name="bank-details" />
                <Stack.Screen name="referrals" />
                <Stack.Screen name="team" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="generation-view" />
                <Stack.Screen name="direct-distributor" />
                <Stack.Screen name="payouts" />
                <Stack.Screen name="wallet-history" />
                <Stack.Screen name="security-settings" />
              </Stack>
              <LockScreen />
              <Toast topOffset={60} />
            </SafeAreaProvider>
          </ThemeProvider>
        </AppLockProvider>
      </AuthProvider>
    </Provider>
  );
}
