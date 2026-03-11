"use client";
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetPayoutsByRangeQuery } from '@/redux/apies/payoutApi';
import { RefreshCw, Calendar, Search, DollarSign, TrendingUp, Users } from 'lucide-react';
import FormattedDate from '@/components/common/FormattedDate';
import Loader from '@/components/common/Loader';
import RefreshButton from '@/components/common/RefreshButton';

export default function PayoutsPage() {
    const { user, logout, isLoggingOut } = useAuth();
    // Helper to get formatted date string (YYYY-MM-DD)
    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    React.useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setStartDate(getFormattedDate(firstDay));
        setEndDate(getFormattedDate(lastDay));
        setIsSearchTriggered(true);
    }, []);

    // Only run query when search is triggered and dates are present
    const { data: payoutsData, isLoading, isFetching, refetch } = useGetPayoutsByRangeQuery(
        { start_date: startDate, end_date: endDate },
        {
            skip: !isSearchTriggered || !startDate || !endDate,
            refetchOnMountOrArgChange: false,
        }
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            setIsSearchTriggered(true);
        }
    };

    const handleRefresh = () => {
        if (isSearchTriggered) {
            refetch();
        }
    };

    const payouts = payoutsData?.data || [];
    const { totalAmount, totalRoi, totalReferral } = React.useMemo(() => {
        let total = 0;
        let roi = 0;
        let referral = 0;
        payouts.forEach(item => {
            const amount = Number(item.amount);
            total += amount;
            if (item.type === 'roi') roi += amount;
            else if (item.type === 'referral') referral += amount;
        });
        return { totalAmount: total, totalRoi: roi, totalReferral: referral };
    }, [payouts]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <DollarSign className="text-primary" size={32} />
                        Payout Reports
                    </h1>
                    <p className="text-muted-foreground mt-1">View your payout history by date range</p>
                </div>
                <RefreshButton
                    onRefresh={handleRefresh}
                    isRefreshing={isFetching}
                    className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/10 shadow-sm relative z-10 cursor-pointer"
                    label="Refresh"
                />
            </div>

            {/* Filter Section */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <Search size={18} />
                        Search
                    </button>
                </form>
            </div>

            {/* Results Section */}
            {isSearchTriggered && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                            <p className="text-sm text-muted-foreground mb-1">Total Payouts</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="bg-linear-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                            <p className="text-sm text-muted-foreground mb-1">ROI Income</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ₹{totalRoi.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="bg-linear-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-4 border border-purple-500/20">
                            <p className="text-sm text-muted-foreground mb-1">Referral Income</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                ₹{totalReferral.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold">Payout History</h3>
                        </div>

                        {isLoading || isFetching ? (
                            <Loader center text="Loading payouts..." className="py-12" />
                        ) : payouts.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30">
                                <RefreshCw size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground">No payouts found for this date range</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {payouts.map((payout) => (
                                    <div key={payout.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${payout.type === 'roi' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                                                {payout.type === 'roi' ? <TrendingUp size={20} /> : <Users size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{payout.type === 'roi' ? 'ROI Income' : 'Referral Income'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    <FormattedDate date={payout.payout_date || payout.created_at} />
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">₹{Number(payout.amount).toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{payout.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
