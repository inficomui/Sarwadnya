/**
 * Theme Constants for Shree Sarwadnya All in one Solution
 * Centralized color palette and styling constants
 */

// Base palette for reusability
const Palette = {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // Slates
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    slate900: '#0f172a',
    slate950: '#020617',

    // Custom Dark
    darkBg: '#0F1115', // Matches LockScreen
    darkCard: '#1A1D24',
};

const CommonColors = {
    primary: { start: '#667eea', end: '#764ba2' },
    secondary: { start: '#f093fb', end: '#f5576c' },
    accent1: { start: '#4facfe', end: '#00f2fe' },
    accent2: { start: '#43e97b', end: '#38f9d7' },
    status: {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    },
    // Keep icon colors consistent or adjust if needed
    icon: {
        purple: '#667eea',
        blue: '#3b82f6',
        yellow: '#f59e0b',
        green: '#10b981',
        red: '#ef4444',
        pink: '#ec4899',
        indigo: '#6366f1',
        sky: '#0ea5e9',
        violet: '#a855f7',
        lime: '#eab308',
    },
};

export const LightColors = {
    ...CommonColors,
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8',
        white: '#ffffff',
        inverse: '#ffffff',
    },
    background: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        white: '#ffffff',
        card: '#ffffff',
        modal: '#ffffff',
    },
    iconBg: {
        purple: '#ede9fe',
        blue: '#dbeafe',
        yellow: '#fef3c7',
        green: '#dcfce7',
        red: '#fee2e2',
        pink: '#fce7f3',
        indigo: '#e0e7ff',
        sky: '#e0f2fe',
        violet: '#f3e8ff',
        lime: '#fef9c3',
    },
    border: '#e2e8f0', // slate200
    shadow: {
        color: '#64748b', // slate500 - colored shadow for light mode
        opacity: 0.08,
    },
};

export const DarkColors = {
    ...CommonColors,
    text: {
        primary: '#f8fafc', // slate50
        secondary: '#94a3b8', // slate400
        muted: '#64748b', // slate500
        white: '#ffffff',
        inverse: '#1e293b',
    },
    background: {
        primary: '#0F1115',
        secondary: '#1A1D24',
        white: '#1e293b', // slate800 - technically "card" bg often
        card: 'rgba(255,255,255,0.05)', // Translucent card style
        modal: '#1A1D24',
    },
    iconBg: {
        // Darker versions for icon backgrounds
        purple: 'rgba(102, 126, 234, 0.15)',
        blue: 'rgba(59, 130, 246, 0.15)',
        yellow: 'rgba(245, 158, 11, 0.15)',
        green: 'rgba(16, 185, 129, 0.15)',
        red: 'rgba(239, 68, 68, 0.15)',
        pink: 'rgba(236, 72, 153, 0.15)',
        indigo: 'rgba(99, 102, 241, 0.15)',
        sky: 'rgba(14, 165, 233, 0.15)',
        violet: 'rgba(168, 85, 247, 0.15)',
        lime: 'rgba(234, 179, 8, 0.15)',
    },
    border: 'rgba(255,255,255,0.1)',
    shadow: {
        color: '#000000',
        opacity: 0.3,
    },
};

// Default export for backward compatibility
export const Colors = LightColors;

export type ThemeColors = typeof LightColors;


export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    round: 1000,
};

export const FontSize = {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 28,
    massive: 32,
    giant: 40,
};

export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const Shadow = {
    small: {
        elevation: 0,
        shadowOpacity: 0,
    },
    medium: {
        elevation: 0,
        shadowOpacity: 0,
    },
    large: {
        elevation: 0,
        shadowOpacity: 0,
    },
    xlarge: {
        elevation: 0,
        shadowOpacity: 0,
    },
};

export const IconSize = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 48,
};

// Common gradient arrays for LinearGradient component
export const Gradients = {
    primary: [Colors.primary.start, Colors.primary.end],
    secondary: [Colors.secondary.start, Colors.secondary.end],
    accent1: [Colors.accent1.start, Colors.accent1.end],
    accent2: [Colors.accent2.start, Colors.accent2.end],
    red: ['#f87171', '#ef4444'],
};

// Common animation durations
export const AnimationDuration = {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
    splash: 1000,
};

// Tab bar configuration
export const TabBar = {
    height: 70,
    borderRadius: 25,
    bottomOffset: 25,
    horizontalPadding: 20,
    verticalPadding: 10,
};
