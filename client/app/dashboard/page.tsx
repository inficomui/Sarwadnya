"use client";
import React, { useMemo } from 'react';
import {
    TrendingUp,
    Users,
    Activity,
    Star,
    RefreshCw,
    Upload,
    List,
    Lock,
    User,
    Landmark,
    History,
    CreditCard,
    ShieldCheck,
    UserPlus,
    FileText,
    Share2,
    PieChart,
} from 'lucide-react';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';
import DashboardStatCard from '@/components/dashboard/DashboardStatCard';
import { DashboardMenuSection } from '@/components/dashboard/DashboardMenuSection';
import { DistributorProfileCard } from '@/components/dashboard/DistributorProfileCard';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

const DashboardWarnings = dynamic(() => import('@/components/dashboard/DashboardWarnings'), {
    loading: () => <div className="h-24 bg-slate-100 animate-pulse rounded-2xl mb-6" />,
    ssr: false
});

const ReferralLinkCard = dynamic(() => import('@/components/dashboard/ReferralLinkCard'), {
    loading: () => <div className="h-24 bg-slate-100 animate-pulse rounded-2xl mb-6" />,
    ssr: false
});

export default function DashboardPage() {
    const { data: dashboardData, isLoading, isError, refetch, isFetching } = useGetUserDashboardQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });

    const data = (dashboardData?.data || {}) as any;
    const { profile, financials, account, referral, network } = data;

    const stats = useMemo(() => {
        return [
            {
                title: "TOTAL INVESTMENT",
                // Prefer active_investment, fallback to total_deposited from the provided JSON
                value: `₹${(financials?.active_investment || financials?.total_deposited || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                icon: Activity,
                color: "bg-purple-600",
            },
            {
                title: "CURRENT RANK",
                value: account?.rank || profile?.rank || "Distributor",
                icon: Star,
                color: "bg-emerald-500",
                subtitle: `Status: ${account?.status || 'active'}`
            },
            {
                title: "TOTAL TEAM",
                value: typeof network?.total_team_size === 'object' ? network.total_team_size.total : (network?.total_team_size || 0),
                icon: Users,
                color: "bg-blue-600",
                subtitle: `Direct: ${typeof network?.direct_partners === 'object' ? network.direct_partners.total : (network?.direct_partners || 0)}`
            },
        ];
    }, [dashboardData]);

    const menuSections = useMemo(() => [
        {
            title: "TopUp",
            color: "bg-red-600",
            items: [
                { label: "TopUp", href: "/dashboard/transfers", icon: Upload },
                { label: "TopUp Details", href: "/dashboard/investments", icon: List },
            ]
        },
        {
            title: "Downline",
            color: "bg-orange-600",
            items: [
                { label: "Direct Distributor", href: "/dashboard/referrals/direct-distributor", icon: Users },
                { label: "My Network", href: "/dashboard/referrals", icon: Share2 },
                { label: "Generation View", href: "/dashboard/referrals/generation-view", icon: TrendingUp },
            ]
        },
        {
            title: "Personal",
            color: "bg-orange-700",
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
                { label: "Payout History", href: "/dashboard/payouts", icon: History },
                { label: "Payment Details", href: "/dashboard/payout-details", icon: CreditCard },
                // { label: "Weekly Report", href: "/dashboard/weekly-report", icon: PieChart },
                { label: "Change TXN Password", href: "/dashboard/profile", icon: ShieldCheck },
            ]
        },
        {
            title: "General",
            color: "bg-purple-600",
            items: [
                { label: "Registration", href: "/signup", icon: UserPlus },
                { label: "Welcome Letter", href: "/dashboard/welcome", icon: FileText },
            ]
        }
    ], []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Activity className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to load data</h3>
                <p className="text-slate-500 mb-6">There was an issue connecting to our servers.</p>
                <Button onClick={() => refetch()} variant="default" className="bg-orange-600 hover:bg-orange-700 gap-2">
                    <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} /> Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Welcome Banner */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                            Welcome, <span className="text-orange-600">{profile?.name || "Member"}!</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Here's what's happening with your account today.</p>
                        <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold font-mono border border-purple-200/50">
                            Ref ID: {profile?.referral_code || referral?.code || "N/A"}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        className={`bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-all ${isFetching ? "animate-spin" : ""}`}
                    >
                        <RefreshCw size={18} className="text-orange-600" />
                    </Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            </div>

            {/* Warnings Section */}
            <DashboardWarnings
                isRestricted={profile?.is_payout_restricted}
                kycStatus={dashboardData?.data?.profile?.kyc_status}
                earningLimitReached={data?.earning_limit?.reached || false}
                earningLimitMessage={data?.earning_limit?.message}
                companySupportNotice={data?.notice}
            />

            {/* Referral Section */}
            <ReferralLinkCard
                referralCode={profile?.referral_code || referral?.code}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <DashboardStatCard key={stat.title} {...stat} className="shadow-sm" />
                ))}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuSections.map((section) => (
                    <DashboardMenuSection
                        key={section.title}
                        title={section.title}
                        color={section.color}
                        items={section.items}
                        className="shadow-sm"
                    />
                ))}
            </div>

            {/* Bottom Profile Card */}
            <DistributorProfileCard
                profile={profile}
                account={account}
                referral={{ code: profile?.referral_code || referral?.code }}
                user={profile}
                isLoading={isLoading}
            />
        </div>
    );
}

