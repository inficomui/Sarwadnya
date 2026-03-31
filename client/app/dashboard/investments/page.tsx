"use client";
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Search, RefreshCw, Loader2, Eye } from 'lucide-react';
import { useGetMyTransfersQuery } from '@/redux/apies/transferApi';
import type { Transfer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import RefreshButton from '@/components/common/RefreshButton';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import FormattedDate from '@/components/common/FormattedDate';

export default function InvestmentsPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState("");

    const handleViewSchedule = (id: number) => {
        router.push(`/dashboard/investments/view?id=${id}`);
    };

    // Fetch transfers data (which represents investments)
    const { data, isLoading, isFetching, refetch } = useGetMyTransfersQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });
    const investments = data?.data?.transfers || [];
    const totalInvested = data?.data?.total_transferred || 0;

    // Filter investments based on search
    const filteredInvestments = React.useMemo(() => {
        if (!investments) return [];
        const sorted = [...investments].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return sorted.filter((investment: Transfer) =>
            investment.amount.toString().includes(search) ||
            investment.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
            investment.method?.toLowerCase().includes(search.toLowerCase())
        );
    }, [investments, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Investments</h1>
                    <p className="text-muted-foreground mt-1">Track and manage your investment portfolio.</p>
                </div>
            </div>

            {/* Investment Summary Card */}
            <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Invested</p>
                        <h2 className="text-3xl font-bold text-foreground">
                            ₹{parseFloat(totalInvested.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search investments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                <RefreshButton
                    onRefresh={refetch}
                    isRefreshing={isFetching}
                    label="Refresh"
                />
            </div>

            {/* Investments Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative min-h-[400px]">
                {(isLoading || isFetching) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 transition-opacity">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Method</th>
                                <th className="px-6 py-4 font-medium">Reference ID</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredInvestments?.map((investment: Transfer) => (
                                <tr key={investment.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-foreground">
                                        ₹{parseFloat(investment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-foreground/80 capitalize">
                                        {investment.method || "Investment"}
                                    </td>
                                    <td className="px-6 py-4 text-foreground/80 font-mono text-xs">
                                        {investment.reference_id || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <FormattedDate date={investment.created_at} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />
                                        <div className="text-[10px]">
                                            <FormattedDate date={investment.created_at} options={{ hour: '2-digit', minute: '2-digit', second: '2-digit' }} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${investment.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                            investment.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                            }`}>
                                            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {investment.investment?.id && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewSchedule(investment.investment!.id)}
                                                        className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>View Payout Schedule</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvestments?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                <TrendingUp className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1">No Investments Yet</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    Your investment history will appear here once you make your first investment.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
