import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkColors, Colors as DefaultColors, LightColors, ThemeColors } from '../constants/Theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    colors: ThemeColors;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    toggleTheme: () => { },
    setTheme: () => { },
    colors: DefaultColors,
    isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [isDark, setIsDark] = useState(false);

    // Load saved theme on startup
    useEffect(() => {
        loadTheme();
    }, []);

    // Update active theme when state or system preference changes
    useEffect(() => {
        updateActiveTheme();
    }, [theme, systemScheme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('app_theme');
            if (savedTheme) {
                if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
                    setThemeState(savedTheme as ThemeMode);
                }
            }
        } catch (error) {
            console.error('Failed to load theme', error);
        }
    };

    const updateActiveTheme = () => {
        let activeDark = false;
        if (theme === 'system') {
            activeDark = systemScheme === 'dark';
        } else {
            activeDark = theme === 'dark';
        }
        setIsDark(activeDark);
    };

    const setTheme = async (mode: ThemeMode) => {
        setThemeState(mode);
        try {
            await AsyncStorage.setItem('app_theme', mode);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const toggleTheme = () => {
        const nextMode = isDark ? 'light' : 'dark';
        setTheme(nextMode);
    };

    // Determine colors
    const colors = isDark ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
