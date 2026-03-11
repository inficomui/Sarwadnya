"use client";
import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    PieChart,
    Wallet,
    Settings,
    FileText,
    Users,
    CreditCard
} from 'lucide-react';
import { userSidebarItems } from '@/lib/userSidebarItems';

export default function TransactionsPage() {
    const { user, logout, isLoggingOut } = useAuth();

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
                    <p className="text-muted-foreground mt-1">View your recent deposits, withdrawals, and earnings.</p>
                </div>

                <div className="bg-card rounded-2xl border border-border p-8 text-center py-20">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <CreditCard size={40} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Transactions Module Coming Soon</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        We are currently working on this feature. Check back later for updates.
                    </p>
                </div>
            </div>
        </>
    );
}
