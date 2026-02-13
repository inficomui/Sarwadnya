"use client";
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetReferralDashboardSummaryQuery, useGetReferralEarningsHistoryQuery } from '@/redux/apies/referralApi';
import { userSidebarItems } from '@/lib/userSidebarItems';
import {
    Users,
    TrendingUp,
    DollarSign,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import FormattedDate from '@/components/common/FormattedDate';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function ReferralDashboardPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch Data
    const { data: summaryData, isLoading: isSummaryLoading } = useGetReferralDashboardSummaryQuery();
    const { data: historyData, isLoading: isHistoryLoading } = useGetReferralEarningsHistoryQuery({
        page,
        per_page: pageSize
    });

    const summary = summaryData?.data;
    const history = historyData?.data;
    const earningsList = history?.data || [];
    const totalItems = history?.total || 0;
    const totalPages = history?.last_page || 1;

    // Prepare Level Wise Data for Chart
    const levelChartData = summary?.level_wise_earnings
        ? Object.entries(summary.level_wise_earnings).map(([level, amount]) => ({
            name: level.replace('level_', 'L-'),
            amount: Number(amount)
        }))
        : [];

    const hasData = levelChartData.some(item => item.amount > 0);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                                <Users className="text-primary" size={32} />
                                Referral Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-1">Track your network performance and earnings</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-xl border border-primary/20 shadow-sm">
                            Total Earnings: ₹{Number(summary?.total_earnings || 0).toLocaleString('en-IN')}
                        </div>
                    </div>

                    {/* Level Wise Earnings Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-xl border border-border shadow-sm p-6"
                        >
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Level Wise Earnings
                            </h3>
                            <div className="h-[300px] w-full">
                                {hasData ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={levelChartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `₹${value}`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--popover))',
                                                    borderColor: 'hsl(var(--border))',
                                                    color: 'hsl(var(--popover-foreground))',
                                                    borderRadius: '8px'
                                                }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                            <Bar dataKey="amount" name="Earnings" radius={[4, 4, 0, 0]}>
                                                {levelChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                                        <TrendingUp size={40} className="mb-2 opacity-20" />
                                        <p>No level earnings data available</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Summary / Stats Placeholders if needed, or simply detailed list intro */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
                                <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
                                <div className="space-y-3 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                                    {levelChartData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-bold font-mono">₹{item.amount.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    {levelChartData.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No earnings breakdown available</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Earnings History Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                    Referral Earnings History
                                </h3>
                                <p className="text-sm text-muted-foreground">Detailed list of your referral commissions</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</label>
                                <select
                                    className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        {isHistoryLoading ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <div className="flex justify-center mb-4">
                                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                </div>
                                Loading earnings history...
                            </div>
                        ) : earningsList.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground bg-muted/10">
                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No referral earnings found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Level</th>
                                            <th className="px-6 py-4 text-left">Source User</th>
                                            <th className="px-6 py-4 text-left">Date</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4 text-right">Net Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {earningsList.map((earning) => (
                                            <tr key={earning.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                        Level {earning.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{earning.source_user?.name}</span>
                                                        <span className="text-xs text-muted-foreground">{earning.source_user?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        <FormattedDate date={earning.payout_date} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${earning.status === 'Paid'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                                        }`}>
                                                        {earning.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    ₹{Number(earning.amount).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-primary">
                                                    ₹{Number(earning.net_amount).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronsLeft size={16} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm font-medium min-w-12 text-center">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages}
                                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={page >= totalPages}
                                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronsRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
