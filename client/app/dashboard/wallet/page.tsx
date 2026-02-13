"use client";
import React, { useState, useMemo, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
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
    Users,
    Clock,
    FileText,
    XCircle,
    CheckCircle2,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Calendar,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import FormattedDate from '@/components/common/FormattedDate';
import Loader from '@/components/common/Loader';
import RefreshButton from '@/components/common/RefreshButton';
import { userSidebarItems } from '@/lib/userSidebarItems';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTransactions from '@/components/wallet/WalletTransactions';
import TopupDialog from '@/components/wallet/TopupDialog';
import InvestForOthersDialog from '@/components/wallet/InvestForOthersDialog';
import { Button } from '@/components/ui/button';
import BankDetailsCard from '@/components/wallet/BankDetailsCard';

type TabType = 'wallet' | 'overview' | 'earnings' | 'withdrawals' | 'investments';

export default function WalletPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('wallet');
    const [payoutPage, setPayoutPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [serverPerPage, setServerPerPage] = useState(10); // Default assumption

    // Calculate which backend page we need based on UI page and sizes
    const apiPage = Math.floor(((payoutPage - 1) * pageSize) / serverPerPage) + 1;

    // Fetch all financial data
    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard, isFetching: isDashboardFetching } = useGetUserDashboardQuery();
    const { data: payoutsData, isLoading: isPayoutsLoading, refetch: refetchPayouts, isFetching: isPayoutsFetching } = useGetMyPayoutsQuery({ page: apiPage, per_page: pageSize });
    const { data: transfersData, isLoading: isTransfersLoading, refetch: refetchTransfers, isFetching: isTransfersFetching } = useGetMyTransfersQuery();
    const { data: depositsData, isLoading: isDepositsLoading, refetch: refetchDeposits, isFetching: isDepositsFetching } = useGetMyDepositsQuery();
    const { data: withdrawalsData, isLoading: isWithdrawalsLoading, refetch: refetchWithdrawals, isFetching: isWithdrawalsFetching } = useGetMineWithdrawalsQuery();
    const { data: walletData, isLoading: isWalletLoading, refetch: refetchWallet, isFetching: isWalletFetching } = useGetWalletQuery();

    useEffect(() => {
        if (payoutsData?.data?.history?.per_page) {
            setServerPerPage(payoutsData.data.history.per_page);
        }
    }, [payoutsData]);

    const isLoading = isDashboardLoading || isPayoutsLoading || isTransfersLoading || isDepositsLoading || isWithdrawalsLoading || isWalletLoading;
    const isFetching = isDashboardFetching || isPayoutsFetching || isTransfersFetching || isDepositsFetching || isWithdrawalsFetching || isWalletFetching;

    const handleRefresh = () => {
        refetchDashboard();
        refetchPayouts();
        refetchTransfers();
        refetchDeposits();
        refetchWithdrawals();
        refetchWallet();
    };

    // Extract data
    const financials = dashboardData?.data?.financials;
    const account = dashboardData?.data?.account;
    const isWalletActive = account?.is_wallet_active ?? false;

    const totalInvested = Number(transfersData?.data?.total_transferred || 0);
    const withdrawalsList = withdrawalsData?.data?.data || [];
    const totalWithdrawnReal = withdrawalsList
        .filter((w: any) => w.status === 'approved')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const totalWithdrawn = totalWithdrawnReal;
    const totalROI = Number(financials?.earnings_breakdown?.roi_income || 0);
    const totalReferralCommission = Number(financials?.earnings_breakdown?.referral_income || 0);
    const totalEarnings = totalROI + totalReferralCommission;

    // Calculate balance
    const currentBalance = totalEarnings;

    // Stats cards
    const stats = [
        {
            label: "Current Balance (Earnings)",
            value: `₹${currentBalance.toLocaleString('en-IN')}`,
            icon: Wallet,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            trend: currentBalance > 0 ? "positive" : "neutral"
        },
        {
            label: "Total Earnings",
            value: `₹${totalEarnings.toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-500/10",
            trend: "positive",
            subtitle: `ROI: ₹${totalROI.toLocaleString('en-IN')} | Referral: ₹${totalReferralCommission.toLocaleString('en-IN')}`
        },
        {
            label: "Total Invested",
            value: `₹${totalInvested.toLocaleString('en-IN')}`,
            icon: ArrowUpRight,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            trend: "neutral"
        },
        {
            label: "Total Withdrawn",
            value: `₹${totalWithdrawn.toLocaleString('en-IN')}`,
            icon: ArrowDownRight,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            trend: "neutral"
        },
    ];

    // Define all tabs
    const allTabs = [
        { id: 'wallet' as TabType, label: 'My Wallet', icon: Wallet, requiresWallet: true },
        { id: 'overview' as TabType, label: 'Overview', icon: Activity },
        { id: 'earnings' as TabType, label: 'Earnings', icon: TrendingUp },
        { id: 'withdrawals' as TabType, label: 'Withdrawals', icon: TrendingDown },
        { id: 'investments' as TabType, label: 'Investments', icon: DollarSign },
    ];

    // Filter tabs based on wallet access
    const tabs = allTabs.filter(tab => !tab.requiresWallet || isWalletActive);

    // Auto-switch to overview if wallet tab is active but wallet is not accessible
    React.useEffect(() => {
        if (activeTab === 'wallet' && !isWalletActive) {
            setActiveTab('overview');
        }
    }, [activeTab, isWalletActive]);

    return (
        <ProtectedRoute>
            <DashboardLayout
                sidebarItems={userSidebarItems}
                user={user ? { ...user, role: 'user' } : undefined}
                onLogout={logout}
                isLoggingOut={isLoggingOut}
            >
                <div className="space-y-6">
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
                        <RefreshButton
                            onRefresh={handleRefresh}
                            isRefreshing={isFetching}
                            className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/10 shadow-sm relative z-10 cursor-pointer"
                        />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold font-mono group-hover:text-primary transition-colors">{stat.value}</h3>
                                {stat.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="border-b border-border bg-muted/30">
                            <div className="flex overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'wallet' && (
                                <WalletTab
                                    walletData={walletData?.data}
                                    isLoading={isWalletLoading}
                                />
                            )}
                            {activeTab === 'overview' && <OverviewTab dashboardData={dashboardData} payoutsData={payoutsData} transfersData={transfersData} />}
                            {activeTab === 'earnings' && (
                                <EarningsTab
                                    payoutsData={payoutsData}
                                    isLoading={isPayoutsLoading}
                                    page={payoutPage}
                                    onPageChange={setPayoutPage}
                                    pageSize={pageSize}
                                    onPageSizeChange={setPageSize}
                                />
                            )}
                            {activeTab === 'withdrawals' && <WithdrawalsTab isLoading={isWithdrawalsLoading} withdrawalsData={withdrawalsData} />}
                            {activeTab === 'investments' && <InvestmentsTab transfersData={transfersData} isLoading={isTransfersLoading} />}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// WalletTab Component
function WalletTab({ walletData, isLoading }: any) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <WalletBalanceCard
                        balance={walletData?.wallet_balance || 0}
                        isLoading={isLoading}
                    />
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                        <div className="mb-3 text-sm text-muted-foreground">
                            Need more funds? Request a wallet top-up.
                        </div>
                        <TopupDialog
                            trigger={
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 p-1 rounded-full">
                                            <Plus size={18} strokeWidth={3} />
                                        </div>
                                        Request Top-up
                                    </div>
                                </Button>
                            }
                        />

                        {/* Invest for Others */}
                        <div className="mb-3 text-sm text-muted-foreground pt-4 border-t border-border/50">
                            Invest wallet balance for others.
                        </div>
                        <InvestForOthersDialog
                            trigger={
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 p-1 rounded-full">
                                            <Users size={18} strokeWidth={3} />
                                        </div>
                                        Invest for Others
                                    </div>
                                </Button>
                            }
                        />
                    </div>

                    {/* Bank Details Card */}
                    <BankDetailsCard />
                </div>
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-sm p-6">
                    <WalletTransactions
                        transactions={walletData?.transactions?.data || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}

// OverviewTab Component
function OverviewTab({ dashboardData, payoutsData, transfersData }: any) {
    const account = dashboardData?.data?.account;
    const financials = dashboardData?.data?.financials;
    const totalInvested = Number(transfersData?.data?.total_transferred || 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign size={20} className="text-primary" />
                        Account Summary
                    </h3>
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                                {account?.status || 'Active'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Joined</span>
                            <span className="font-medium">
                                {account?.joined_at ? <FormattedDate date={account.joined_at} /> : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Invested</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                ₹{totalInvested.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Withdrawn</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                                ₹0
                            </span>
                        </div>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Earnings Breakdown
                    </h3>
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total ROI</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                ₹{Number(financials?.earnings_breakdown?.roi_income || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Referral Commission</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                                ₹{Number(financials?.earnings_breakdown?.referral_income || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-border">
                            <span className="font-medium">Total Earnings</span>
                            <span className="font-bold text-lg text-primary">
                                ₹{(Number(financials?.earnings_breakdown?.roi_income || 0) + Number(financials?.earnings_breakdown?.referral_income || 0)).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Earnings Tab Component
function EarningsTab({ payoutsData, isLoading, page, onPageChange, pageSize, onPageSizeChange }: any) {
    const history = payoutsData?.data?.history?.data || [];
    const meta = payoutsData?.data?.history; // pagination meta
    const summary = payoutsData?.data?.summary;
    const serverPerPage = meta?.per_page || 10;
    const totalItems = meta?.total || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Process data for chart
    const chartData = useMemo(() => {
        if (!history.length) return [];

        const map = new Map();
        // Sort by date ascending
        const sorted = [...history].sort((a: any, b: any) =>
            new Date(a.payout_date || a.created_at).getTime() - new Date(b.payout_date || b.created_at).getTime()
        );

        sorted.forEach((item: any) => {
            const date = new Date(item.payout_date || item.created_at);
            const key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

            if (!map.has(key)) {
                map.set(key, { name: key, roi: 0, referral: 0 });
            }

            const entry = map.get(key);
            const amount = Number(item.amount);
            if (item.type === 'roi') entry.roi += amount;
            else entry.referral += amount;
        });

        return Array.from(map.values());
    }, [history]);

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-semibold text-popover-foreground mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-muted-foreground capitalize">{entry.name}:</span>
                            <span className="text-sm font-medium text-foreground">
                                ₹{entry.value.toLocaleString('en-IN')}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-primary">
                            ₹{(payload.reduce((sum: number, entry: any) => sum + entry.value, 0)).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return <Loader center text="Loading earnings history..." className="py-8" />;
    }

    // Determine the slice of data to show based on local state vs server response
    const startIndex = ((page - 1) * pageSize) % serverPerPage;
    const displayedHistory = history.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{Number(summary?.total_earnings || 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-linear-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Total ROI</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{Number(summary?.total_roi || 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-linear-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Referral Commission</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        ₹{Number(summary?.total_referral_commission || 0).toLocaleString('en-IN')}
                    </p>
                </div>
            </div>

            {/* Earnings Chart */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Earnings Overview
                </h3>
                <div className="h-[350px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                <Bar dataKey="roi" name="Monthly ROI" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={40} />
                                <Bar dataKey="referral" name="Referral Bonus" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                            <BarChart3 size={40} className="mb-2 opacity-20" />
                            <p>No enough data to display chart</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Earnings History List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Earnings History</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Show:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                onPageSizeChange(Number(e.target.value));
                                onPageChange(1);
                            }}
                            className="px-2 py-1 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                {displayedHistory.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <Activity size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No earnings history yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayedHistory.map((payout: any) => (
                            <div key={payout.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${payout.type === 'roi' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                                        {payout.type === 'roi' ? <TrendingUp size={20} /> : <Users size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {payout.type === 'roi' ? 'Monthly ROI' : `Level ${payout.level || 0} Referral`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <FormattedDate date={payout.payout_date || payout.created_at} />
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600 dark:text-green-400">
                                        +₹{Number(payout.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                    Showing {Math.min(((page - 1) * pageSize) + 1, totalItems)} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium min-w-12 text-center">
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={page >= totalPages}
                        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function WithdrawalsTab({ isLoading, withdrawalsData }: any) {
    const withdrawals = withdrawalsData?.data?.data || [];
    const approvedWithdrawals = withdrawals.filter((i: any) => i.status === 'approved');
    const totalWithdrawn = approvedWithdrawals.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    const pendingWithdrawals = withdrawals.filter((i: any) => i.status === 'pending');
    const totalPending = pendingWithdrawals.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    if (isLoading) {
        return <Loader center text="Loading withdrawal history..." className="py-12" />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* Summary Section / Alert Card Style */}
                <div className="p-8 bg-linear-to-br from-orange-500/20 via-orange-500/5 to-transparent border-b border-orange-500/10">
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium">
                                <TrendingDown size={20} />
                                <span>Total Withdrawn</span>
                            </div>
                            <h2 className="text-4xl xs:text-5xl font-bold text-foreground">
                                ₹{totalWithdrawn.toLocaleString('en-IN')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Across {approvedWithdrawals.length} successful transaction{approvedWithdrawals.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {totalPending > 0 && (
                            <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 px-5 py-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-600">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-yellow-600 dark:text-yellow-400 tracking-wider">Pending Approval</p>
                                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">₹{totalPending.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText size={20} className="text-muted-foreground" />
                            Withdrawal History
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            {withdrawals.length} Records
                        </span>
                    </div>

                    <div className="space-y-3">
                        {withdrawals.length === 0 ? (
                            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                                <TrendingDown size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground font-medium">No withdrawals found</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">You haven't made any withdrawals yet.</p>
                            </div>
                        ) : (
                            withdrawals.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                        <div className={`p-3 rounded-xl shrink-0 mt-1 md:mt-0 ${item.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                            item.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                'bg-yellow-500/10 text-yellow-600'
                                            }`}>
                                            {item.status === 'approved' ? <CheckCircle2 size={20} /> :
                                                item.status === 'rejected' ? <XCircle size={20} /> :
                                                    <Clock size={20} />}
                                        </div>

                                        <div className="space-y-1 w-full">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-foreground">
                                                    Withdrawal Request
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-green-500/10 text-green-600 border border-green-500/10' :
                                                    item.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
                                                        'bg-yellow-500/10 text-yellow-600 border border-yellow-500/10'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <FormattedDate date={item.created_at} />
                                                </span>
                                                {item.reference_id && (
                                                    <span className="font-mono opacity-80">
                                                        Ref: {item.reference_id}
                                                    </span>
                                                )}
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-muted-foreground/80 italic mt-1 line-clamp-1">
                                                    "{item.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto md:block text-right">
                                        <p className="text-sm text-muted-foreground md:hidden">Amount</p>
                                        <p className="text-xl font-bold font-mono text-foreground">
                                            ₹{Number(item.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InvestmentsTab({ transfersData, isLoading }: any) {
    const investments = transfersData?.data?.transfers || [];

    // Calculate totals
    const approvedInvestments = investments.filter((i: any) => i.status === 'approved');
    const totalApproved = approvedInvestments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    const pendingInvestments = investments.filter((i: any) => i.status === 'pending');
    const totalPending = pendingInvestments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    if (isLoading) {
        return <Loader center text="Loading investment history..." className="py-12" />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* Summary Section / Alert Card Style */}
                <div className="p-8 bg-linear-to-br from-green-500/20 via-green-500/5 to-transparent border-b border-green-500/10">
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                                <DollarSign size={20} />
                                <span>Total Approved Investments</span>
                            </div>
                            <h2 className="text-4xl xs:text-5xl font-bold text-foreground">
                                ₹{totalApproved.toLocaleString('en-IN')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Across {approvedInvestments.length} successful transaction{approvedInvestments.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {totalPending > 0 && (
                            <div className="bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 px-5 py-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-full text-orange-600">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">Pending Approval</p>
                                    <p className="text-lg font-bold text-orange-700 dark:text-orange-300">₹{totalPending.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText size={20} className="text-muted-foreground" />
                            Investment History
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            {investments.length} Records
                        </span>
                    </div>

                    <div className="space-y-3">
                        {investments.length === 0 ? (
                            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                                <TrendingUp size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground font-medium">No investments found</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">Start your journey by making a new investment.</p>
                            </div>
                        ) : (
                            investments.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                        <div className={`p-3 rounded-xl shrink-0 mt-1 md:mt-0 ${item.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                            item.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                'bg-orange-500/10 text-orange-600'
                                            }`}>
                                            {item.status === 'approved' ? <CheckCircle2 size={20} /> :
                                                item.status === 'rejected' ? <XCircle size={20} /> :
                                                    <Clock size={20} />}
                                        </div>

                                        <div className="space-y-1 w-full">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-foreground">
                                                    {item.method}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-green-500/10 text-green-600 border border-green-500/10' :
                                                    item.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
                                                        'bg-orange-500/10 text-orange-600 border border-orange-500/10'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <FormattedDate date={item.created_at} />
                                                </span>
                                                {item.reference_id && (
                                                    <span className="font-mono opacity-80">
                                                        Ref: {item.reference_id}
                                                    </span>
                                                )}
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-muted-foreground/80 italic mt-1 line-clamp-1">
                                                    "{item.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto md:block text-right">
                                        <p className="text-sm text-muted-foreground md:hidden">Amount</p>
                                        <p className="text-xl font-bold font-mono text-foreground">
                                            ₹{Number(item.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

