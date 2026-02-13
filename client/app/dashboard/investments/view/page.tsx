"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import UserInvestmentWrapper from '@/components/dashboard/UserInvestmentWrapper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { userSidebarItems } from '@/lib/userSidebarItems';

function InvestmentDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const investmentId = id ? parseInt(id) : 0;

    if (!investmentId) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                <p>Invalid or missing Investment ID.</p>
            </div>
        );
    }

    return (
        <UserInvestmentWrapper investmentId={investmentId} />
    );
}

export default function InvestmentDetailsPage() {
    const { user, logout, isLoggingOut } = useAuth();

    return (
        <ProtectedRoute>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading details...</div>}>
                <InvestmentDetailsContent />
            </Suspense>
        </ProtectedRoute>
    );
}
