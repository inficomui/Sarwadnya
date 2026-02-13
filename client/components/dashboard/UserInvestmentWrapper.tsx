"use client";
import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { userSidebarItems } from '@/lib/userSidebarItems';
import InvestmentDetailsView from '@/components/dashboard/InvestmentDetailsView';

interface UserInvestmentWrapperProps {
    investmentId: number;
}

export default function UserInvestmentWrapper({ investmentId }: UserInvestmentWrapperProps) {
    const { user, logout, isLoggingOut } = useAuth();

    return (
        <ProtectedRoute>
            <DashboardLayout
                sidebarItems={userSidebarItems}
                user={user ? { ...user, role: 'user' } : undefined}
                onLogout={logout}
                isLoggingOut={isLoggingOut}
            >
                <InvestmentDetailsView investmentId={investmentId} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
