"use client";
import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';
import {
    Upload,
    List,
    Wallet,
    Send,
    Users,
    Network,
    GitBranch,
    Lock,
    User,
    Landmark,
    History,
    FileText,
    Shield,
    UserPlus,
    Mail,
    Copy,
    Check,
    RefreshCw,
    TrendingUp,
    Star,
    CreditCard,
    BadgeCheck,
    Calendar,
    Hash,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userSidebarItems } from '@/lib/userSidebarItems';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { DashboardMenuSection } from '@/components/dashboard/DashboardMenuSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import RefreshButton from '@/components/common/RefreshButton';
import { DistributorProfileCard } from '@/components/dashboard/DistributorProfileCard';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, isLoggingOut } = useAuth();
    const { data: dashboardData, isLoading, refetch, isFetching } = useGetUserDashboardQuery();
    const [isCopied, setIsCopied] = React.useState(false);

    const profile = dashboardData?.data?.profile;
    const referral = dashboardData?.data?.referral;
    const account = dashboardData?.data?.account;
    const financials = dashboardData?.data?.financials;
    const earning_limit = dashboardData?.data?.earning_limit;
    const network = dashboardData?.data?.network;
    const isWalletActive = account?.is_wallet_active ?? false;

    // Use server-provided balance
    const walletBalance = Number(financials?.available_balance || 0);
    const isIdsActive = earning_limit?.reached;

    // Check if user is restricted (Flag from backend OR Invested exactly 10,000)
    const isRestricted = profile?.is_payout_restricted || Number(financials?.total_deposited || 0) === 10000;

    const handleCopyLink = () => {
        if (!referral?.code) return;
        const link = `${window.location.origin}/signup?ref=${referral.code}`;
        navigator.clipboard.writeText(link);
        setIsCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const allMenuSections = [
        {
            title: "TopUp",
            color: "bg-red-600",
            items: [
                { label: "TopUp", href: "/dashboard/investments", icon: Upload },
                { label: "TopUp Details", href: "/dashboard/investments", icon: List },
            ]
        },
        {
            title: "Wallet System",
            color: "bg-blue-600",
            showOnlyIf: isWalletActive,
            items: [
                { label: "Wallet Request", href: "/dashboard/wallet", icon: Wallet },
                { label: "Wallet Transfer", href: "/dashboard/transfers", icon: Send },
            ]
        },
        {
            title: "Downline",
            color: "bg-orange-500",
            items: [
                { label: "Direct Distributor", href: "/dashboard/referrals/direct-distributor", icon: Users, disabled: isIdsActive },
                { label: "My Network", href: "/dashboard/referrals/generation-view", icon: Network, disabled: isIdsActive },
                { label: "Generation View", href: "/dashboard/referrals/generation-view", icon: GitBranch, disabled: isIdsActive },
            ]
        },
        {
            title: "Personal",
            color: "bg-amber-600",
            items: [
                { label: "Change Password", href: "/dashboard/profile", icon: Lock },
                { label: "Personal Details", href: "/dashboard/profile", icon: User },
                { label: "Banking Details", href: "/dashboard/profile", icon: Landmark },
            ]
        },
        {
            title: "Income Details",
            color: "bg-indigo-900",
            items: [
                { label: "Payout History", href: "/dashboard/transactions", icon: History, disabled: isIdsActive },
                { label: "Payment Details", href: "/dashboard/wallet", icon: FileText, disabled: isIdsActive },
                { label: "Change TXN Password", href: "/dashboard/profile", icon: Shield },
            ]
        },
        {
            title: "General",
            color: "bg-purple-600",
            items: [
                { label: "Registration", href: "/signup", icon: UserPlus },
                { label: "Welcome Letter", href: "/dashboard/welcome", icon: Mail },
            ]
        }
    ];

    // Filter menu sections based on wallet access
    const menuSections = allMenuSections.filter(section =>
        section.showOnlyIf === undefined || section.showOnlyIf === true
    );

    const referralLink = typeof window !== 'undefined' && referral?.code
        ? `${window.location.origin}/signup?ref=${referral.code}`
        : "Loading...";

    return (
        <ProtectedRoute>
            <DashboardLayout
                sidebarItems={userSidebarItems}
                user={user ? { ...user, role: 'user' } : undefined}
                onLogout={logout}
                isLoggingOut={isLoggingOut}
            >
                <div className="space-y-8 pb-12 max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-linear-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Welcome, <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">{profile?.name || user?.name || "User"}!</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Here's what's happening with your account today.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {referral?.code && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                        Ref ID: {referral.code}
                                    </span>
                                )}
                            </div>
                        </div>
                        <RefreshButton
                            onRefresh={() => refetch()}
                            isRefreshing={isFetching}
                            className="relative z-10 gap-2 cursor-pointer shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-orange-600 dark:text-orange-400"
                        />
                    </div>

                    {/* Restricted User Warning */}
                    {isRestricted && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm"
                        >
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400 shrink-0">
                                <Lock size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                                    ROI Payouts Disabled
                                </h3>
                                <p className="text-orange-700 dark:text-orange-300 mt-1">
                                    Your account is active and eligible for Referral Commissions. However, Daily ROI payouts are not available for this plan (₹10,000).
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Earning Limit Warning */}
                    {earning_limit?.reached && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm"
                        >
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                    Earning Limit Reached
                                </h3>
                                <p className="text-red-700 dark:text-red-300 mt-1">
                                    {earning_limit.message}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* KYC Status Warning */}
                    {profile?.kyc_status === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm mb-6"
                        >
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full text-yellow-600 dark:text-yellow-400 shrink-0">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                                    KYC Verification Pending
                                </h3>
                                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                                    Your KYC documents are currently under review. Some features might be limited until verification is complete.
                                </p>
                            </div>
                        </motion.div>
                    )}
                    {profile?.kyc_status === 'rejected' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm mb-6"
                        >
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                    KYC Verification Rejected
                                </h3>
                                <p className="text-red-700 dark:text-red-300 mt-1">
                                    Your KYC documents were rejected. Please update your documents in the profile section.
                                </p>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="mt-2"
                                    onClick={() => router.push('/dashboard/profile?tab=kyc')}
                                >
                                    Update KYC
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Referral Link Section - Enhanced */}
                    {isIdsActive ? (
                        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 opacity-75">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Referral Link Locked</h3>
                                    <p className="text-sm text-slate-500">Top up your account to unlock referral features.</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => toast.error("Please top up to unlock referrals")}>
                                Locked
                            </Button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />

                            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                <div className="flex items-center gap-3 md:w-auto">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Your Referral Link</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Share this link to grow your network</p>
                                    </div>
                                </div>

                                <div className="flex-1 w-full flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <Input
                                        readOnly
                                        value={referralLink}
                                        className="border-none shadow-none bg-transparent font-mono text-sm focus-visible:ring-0 text-slate-700 dark:text-slate-200 font-medium"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleCopyLink}
                                        className={isCopied
                                            ? "bg-green-600 hover:bg-green-700 text-white min-w-[120px] rounded-lg shadow-md transition-all shadow-green-500/20"
                                            : "bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] rounded-lg shadow-md transition-all shadow-blue-500/20"
                                        }
                                    >
                                        {isCopied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                                        {isCopied ? "Copied!" : "Copy Link"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Top Stats Cards */}
                    <div className={`grid grid-cols-1 ${isWalletActive ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
                        <DashboardStatCard
                            title="Total Investment"
                            value={`₹${Number(financials?.total_deposited || 0).toFixed(2)}`}
                            color="bg-purple-500"
                            icon={TrendingUp}
                            delay={0.1}
                        />
                        <DashboardStatCard
                            title="Current Rank"
                            value={account?.rank || "Member"}
                            subtitle={`Status: ${account?.status || 'Inactive'}`}
                            color="bg-green-500"
                            icon={Star}
                            delay={0.2}
                        />
                        <DashboardStatCard
                            title="Total Team"
                            value={String(network?.total_team_size || 0)}
                            subtitle={`Direct: ${network?.direct_partners || 0}`}
                            color="bg-blue-500"
                            icon={Users}
                            delay={0.3}
                        />
                        {isWalletActive && (
                            <DashboardStatCard
                                title="Wallet Balance"
                                value={`₹${walletBalance.toFixed(2)}`}
                                subtitle="Available to Withdraw"
                                color="bg-red-500"
                                icon={CreditCard}
                                delay={0.4}
                            />
                        )}
                    </div>

                    {/* Action Menu Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {menuSections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (index * 0.1) }}
                                className="h-full"
                            >
                                <DashboardMenuSection
                                    title={section.title}
                                    color={section.color}
                                    items={section.items}
                                    className="h-full"
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Distributor Profile Card */}
                    <DistributorProfileCard
                        user={user || undefined}
                        profile={profile}
                        referral={referral}
                        account={account}
                    />
                </div>
            </DashboardLayout>
        </ProtectedRoute >
    );
}


