"use client";
import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { userSidebarItems } from '@/lib/userSidebarItems';

export default function UserDashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isLoggingOut } = useAuth();

    const memoizedUser = React.useMemo(() =>
        user ? { ...user, role: 'user' as const } : undefined,
        [user]);

    return (
        <ProtectedRoute>
            <DashboardLayout
                sidebarItems={userSidebarItems}
                user={memoizedUser}
                onLogout={logout}
                isLoggingOut={isLoggingOut}
            >
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
