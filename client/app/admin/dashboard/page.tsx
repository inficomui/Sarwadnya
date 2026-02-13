"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAdminDashboardDataQuery } from "@/redux/apies/adminApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { AdminUser, User } from "@/lib/types";
import {
    Users,
    DollarSign,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownRight,

    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import FormattedDate from "@/components/common/FormattedDate";
import Loader from "@/components/common/Loader";
import RefreshButton from "@/components/common/RefreshButton";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from "next-themes";

// Helper for 'time ago' format
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

export default function AdminDashboard() {
    const router = useRouter();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { adminUser } = useAdminAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Chart Data with fallback

    // Fetch Dashboard Data
    const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError, refetch, isFetching } = useGetAdminDashboardDataQuery(undefined, {
        skip: !adminUser,
    });
    const chartData = dashboardData?.revenue_chart_data || [
        { name: 'Mon', value: 1 },
        { name: 'Tue', value: 2 },
        { name: 'Wed', value: 3 },
        { name: 'Thu', value: 2 },
        { name: 'Fri', value: 1 },
        { name: 'Sat', value: 4 },
        { name: 'Sun', value: 5 },
    ];



    useEffect(() => {
        if (dashboardError) {
            console.error("Dashboard fetch error:", dashboardError);
        }
    }, [dashboardError]);

    if (!adminUser) return null;

    if (isDashboardLoading && !dashboardData) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <Loader center text="Loading dashboard overview..." />
            </div>
        );
    }

    // Process Stats with Real Data where available
    const stats = [
        {
            title: "Total Revenue",
            value: `₹${(dashboardData?.metrics?.total_revenue || 0).toLocaleString('en-IN')}`,
            trend: "up" as const,
            icon: DollarSign,
            color: "bg-amber-500",
        },
        {
            title: "Total Users",
            value: dashboardData?.metrics?.total_users?.toLocaleString() || "0",
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Active Investments",
            value: (dashboardData?.metrics?.active_investments_count || 0).toLocaleString(),
            trend: "down" as const,
            icon: Activity,
            color: "bg-purple-500",
        },
        {
            title: "Pending Withdrawals",
            value: (dashboardData?.metrics?.pending_withdrawals_count || 0).toLocaleString(),
            icon: CreditCard,
            color: "bg-red-500",
        }
    ];

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-linear-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck size={12} />
                            Admin Panel
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        Welcome back, <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-200">{adminUser.name}!</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                        <p className="text-base">
                            System overview and alerts for today. <FormattedDate date={new Date()} options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }} />
                        </p>
                        <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
                    </div>
                    <div>
                        <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Ref ID: #{adminUser?.referral_code}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-3 mt-4 md:mt-0">
                    <RefreshButton
                        onRefresh={refetch}
                        isRefreshing={isFetching}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer gap-2 backdrop-blur-sm"
                    />
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 dark:shadow-orange-900/20 gap-2">
                        <TrendingUp size={16} />
                        Reports
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <DashboardStatCard
                        key={i}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        delay={i * 0.1}
                    />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Analytics Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity size={20} className="text-orange-500" />
                                Revenue Analytics
                            </h3>
                            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm px-3 py-1.5 outline-none text-slate-600 dark:text-slate-300 cursor-pointer hover:border-orange-500/50 transition-colors">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Year</option>
                            </select>
                        </div>

                        <div className="h-[350px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                            {mounted ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                                borderRadius: '8px',
                                                color: theme === 'dark' ? '#fff' : '#0f172a',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            itemStyle={{ color: '#f97316' }}
                                            formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#f97316"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Loader size="lg" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Registrations Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Users</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 px-2"
                                onClick={() => router.push('/admin/dashboard/users')}
                            >
                                View All
                            </Button>
                        </div>

                        <div className="space-y-1 flex-1 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                            {dashboardData?.recent_users && dashboardData.recent_users.length > 0 ? (
                                dashboardData.recent_users.map((user: User, i: number) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0 shadow-sm group-hover:scale-105 transition-transform group-hover:bg-orange-100 dark:group-hover:bg-slate-700 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {user.name}
                                            </h4>
                                            <div className="flex flex-col">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {user.referral_code}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold tracking-wide uppercase ${user.email_verified_at
                                                ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                                }`}>
                                                {user.email_verified_at ? 'Verified' : 'Pending'}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(user.created_at)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                                    <Users className="w-8 h-8 mb-2 opacity-20" />
                                    No recent users found.
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full mt-4 bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border-0"
                            onClick={() => router.push('/admin/dashboard/users')}
                        >
                            View All Users
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
