"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';
import { useGetMyPayoutsQuery } from '@/redux/apies/payoutApi';
import { useGetMyTransfersQuery } from '@/redux/apies/transferApi';
import { useGetMyDepositsQuery } from '@/redux/apies/depositApi';
import { useGetMineWithdrawalsQuery } from '@/redux/apies/withdrawalApi';
import { useGetWalletQuery } from '@/redux/apies/walletApi';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import RefreshButton from '@/components/common/RefreshButton';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTransactions from '@/components/wallet/WalletTransactions';
import TopupDialog from '@/components/wallet/TopupDialog';
import InvestForOthersDialog from '@/components/wallet/InvestForOthersDialog';
import { Button } from '@/components/ui/button';
import BankDetailsCard from '@/components/wallet/BankDetailsCard';
import DashboardWarnings from '@/components/dashboard/DashboardWarnings';

// Extracted Tab Components
import OverviewTab from '@/components/wallet/tabs/OverviewTab';
import EarningsTab from '@/components/wallet/tabs/EarningsTab';
import WithdrawalsTab from '@/components/wallet/tabs/WithdrawalsTab';
import InvestmentsTab from '@/components/wallet/tabs/InvestmentsTab';

type TabType = 'wallet' | 'overview' | 'earnings' | 'withdrawals' | 'investments';

export default function WalletPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('wallet');
    const [payoutPage, setPayoutPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [serverPerPage, setServerPerPage] = useState(10);

    // Fetch all financial data
    const { data: dashboardData, refetch: refetchDashboard, isFetching: isDashboardFetching } = useGetUserDashboardQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });

    // Calculate which backend page we need based on UI page and sizes
    const apiPage = useMemo(() => Math.floor(((payoutPage - 1) * pageSize) / serverPerPage) + 1, [payoutPage, pageSize, serverPerPage]);

    const { data: payoutsData, isLoading: isPayoutsLoading, refetch: refetchPayouts, isFetching: isPayoutsFetching } = useGetMyPayoutsQuery(
        { page: apiPage, per_page: pageSize },
        {
            skip: activeTab !== 'earnings' && activeTab !== 'overview',
            refetchOnMountOrArgChange: false,
        }
    );
    const { data: transfersData, isLoading: isTransfersLoading, refetch: refetchTransfers, isFetching: isTransfersFetching } = useGetMyTransfersQuery(
        undefined,
        {
            skip: activeTab !== 'investments' && activeTab !== 'overview',
            refetchOnMountOrArgChange: false,
        }
    );
    const { data: depositsData, refetch: refetchDeposits, isFetching: isDepositsFetching } = useGetMyDepositsQuery(
        undefined,
        {
            skip: activeTab !== 'wallet',
            refetchOnMountOrArgChange: false,
        }
    );
    const { data: withdrawalsData, isLoading: isWithdrawalsLoading, refetch: refetchWithdrawals, isFetching: isWithdrawalsFetching } = useGetMineWithdrawalsQuery(
        undefined,
        {
            skip: activeTab !== 'withdrawals',
            refetchOnMountOrArgChange: false,
        }
    );
    const { data: walletData, isLoading: isWalletLoading, refetch: refetchWallet, isFetching: isWalletFetching } = useGetWalletQuery(
        undefined,
        {
            skip: activeTab !== 'wallet',
            refetchOnMountOrArgChange: false,
        }
    );

    useEffect(() => {
        if (payoutsData?.data?.history?.per_page) {
            setServerPerPage(payoutsData.data.history.per_page);
        }
    }, [payoutsData]);

    const isFetching = isDashboardFetching || isPayoutsFetching || isTransfersFetching || isDepositsFetching || isWithdrawalsFetching || isWalletFetching;

    const handleRefresh = useCallback(() => {
        refetchDashboard();
        refetchPayouts();
        refetchTransfers();
        refetchDeposits();
        refetchWithdrawals();
        refetchWallet();
    }, [refetchDashboard, refetchPayouts, refetchTransfers, refetchDeposits, refetchWithdrawals, refetchWallet]);

    // Financial calculations
    const account = dashboardData?.data?.account;
    const isWalletActive = account?.is_wallet_active ?? false;

    const { totalInvested, totalWithdrawn, currentBalance, totalROI, totalReferralCommission, totalEarnings } = useMemo(() => {
        const financials = dashboardData?.data?.financials;

        const invested = Number(financials?.total_deposited || 0);
        const withdrawn = Number(financials?.total_withdrawn || 0);
        const currentBal = Number(financials?.available_balance || 0);

        const roi = Number(financials?.earnings_breakdown?.roi_income || 0);
        const referral = Number(financials?.earnings_breakdown?.referral_income || 0);
        const earnings = Number(financials?.total_earnings || 0);

        return {
            totalInvested: invested,
            totalWithdrawn: withdrawn,
            totalROI: roi,
            totalReferralCommission: referral,
            currentBalance: currentBal,
            totalEarnings: earnings
        };
    }, [dashboardData]);

    const stats = useMemo(() => [
        { label: "Current Balance (Earnings)", value: `₹${currentBalance.toLocaleString('en-IN')}`, icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", subtitle: `ROI: ₹${totalROI.toLocaleString('en-IN')} | Referral: ₹${totalReferralCommission.toLocaleString('en-IN')}` },
        { label: "Total Invested", value: `₹${totalInvested.toLocaleString('en-IN')}`, icon: ArrowUpRight, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Total Withdrawn", value: `₹${totalWithdrawn.toLocaleString('en-IN')}`, icon: ArrowDownRight, color: "text-orange-500", bg: "bg-orange-500/10" },
    ], [currentBalance, totalEarnings, totalROI, totalReferralCommission, totalInvested, totalWithdrawn]);

    const tabs = useMemo(() => [
        { id: 'wallet' as TabType, label: 'My Wallet', icon: Wallet, show: isWalletActive },
        { id: 'overview' as TabType, label: 'Overview', icon: Activity, show: true },
        { id: 'earnings' as TabType, label: 'Earnings', icon: TrendingUp, show: true },
        { id: 'withdrawals' as TabType, label: 'Withdrawals', icon: TrendingDown, show: true },
        { id: 'investments' as TabType, label: 'Investments', icon: DollarSign, show: true },
    ].filter(t => t.show), [isWalletActive]);

    useEffect(() => {
        if (activeTab === 'wallet' && !isWalletActive) setActiveTab('overview');
    }, [isWalletActive, activeTab]);

    return (
        <div className="space-y-6">
            {/* Restriction Notice */}
            <DashboardWarnings
                isRestricted={dashboardData?.data?.profile?.is_payout_restricted || false}
                kycStatus={dashboardData?.data?.profile?.kyc_status}
                earningLimitReached={dashboardData?.data?.earning_limit?.reached || false}
                earningLimitMessage={dashboardData?.data?.earning_limit?.message}
                companySupportNotice={dashboardData?.data?.notice}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Wallet className="text-primary" size={32} />
                        Financial Summary
                    </h1>
                    <p className="text-muted-foreground mt-1">Complete overview of your financial activities</p>
                </div>
                <RefreshButton onRefresh={handleRefresh} isRefreshing={isFetching} className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/10 shadow-sm relative z-10 cursor-pointer" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold font-mono group-hover:text-primary transition-colors">{stat.value}</h3>
                        {stat.subtitle && <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>}
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[500px]">
                <div className="border-b border-border bg-muted/30">
                    <div className="flex overflow-x-auto scrollbar-none">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'wallet' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-4">
                                <WalletBalanceCard balance={walletData?.data?.wallet_balance || 0} isLoading={isWalletLoading} />
                                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                                    <p className="mb-3 text-sm text-muted-foreground">Need more funds? Request a wallet top-up.</p>
                                    <TopupDialog trigger={<Button disabled={!!dashboardData?.data?.notice} className="w-full bg-primary hover:bg-primary/90 text-white py-6 shadow-lg shadow-primary/20 transition-all font-semibold"><Plus size={18} className="mr-2" strokeWidth={3} /> Request Top-up</Button>} />
                                    <p className="mb-3 text-sm text-muted-foreground pt-4 border-t border-border/50 mt-4">Invest wallet balance for others.</p>
                                    <InvestForOthersDialog trigger={<Button disabled={!!dashboardData?.data?.notice} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 shadow-lg shadow-indigo-500/20 transition-all font-semibold"><Users size={18} className="mr-2" strokeWidth={3} /> Invest for Others</Button>} />
                                </div>
                                <BankDetailsCard />
                            </div>
                            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6">
                                <WalletTransactions transactions={walletData?.data?.transactions?.data || []} isLoading={isWalletLoading} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'overview' && <OverviewTab dashboardData={dashboardData} transfersData={transfersData} />}
                    {activeTab === 'earnings' && <EarningsTab payoutsData={payoutsData} isLoading={isPayoutsLoading} page={payoutPage} onPageChange={setPayoutPage} pageSize={pageSize} onPageSizeChange={setPageSize} />}
                    {activeTab === 'withdrawals' && <WithdrawalsTab isLoading={isWithdrawalsLoading} withdrawalsData={withdrawalsData} />}
                    {activeTab === 'investments' && <InvestmentsTab transfersData={transfersData} isLoading={isTransfersLoading} />}
                </div>
            </div>
        </div>
    );
}
