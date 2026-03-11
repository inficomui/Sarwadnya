"use client";
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetPayoutsByRangeQuery } from '@/redux/apies/payoutApi';
import { Calendar, Search, FileText } from 'lucide-react';
import Loader from '@/components/common/Loader';
import RefreshButton from '@/components/common/RefreshButton';
import PayoutDetailsTable from '@/components/dashboard/PayoutDetailsTable';

export default function PayoutDetailsPage() {
    const { user } = useAuth();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isSearchTriggered, setIsSearchTriggered] = useState(true); // Default to true to load all data initially

    const { data: payoutsData, isLoading, isFetching, refetch } = useGetPayoutsByRangeQuery(
        {
            start_date: startDate || undefined,
            end_date: endDate || undefined
        },
        {
            skip: !isSearchTriggered,
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

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-8 rounded-4xl border border-border/40 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-primary/20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <FileText className="text-primary" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">
                                Payout <span className="text-primary italic">Statement</span>
                            </h1>
                            <p className="text-muted-foreground font-medium">Detailed tracking of your financial growth</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full lg:w-auto">
                    <RefreshButton
                        onRefresh={handleRefresh}
                        isRefreshing={isFetching}
                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-sm h-12 w-12 flex items-center justify-center rounded-2xl transition-all cursor-pointer"
                    />
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-card/50 backdrop-blur-sm p-2 rounded-[2.5rem] border border-border/50 shadow-inner">
                <div className="bg-card p-6 rounded-4xl border border-border shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Statistical Period Start</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 bg-muted/30 border border-transparent focus:border-primary/30 rounded-2xl outline-none transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Statistical Period End</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 bg-muted/30 border border-transparent focus:border-primary/30 rounded-2xl outline-none transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full md:w-auto h-14 px-10 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Search size={22} strokeWidth={3} />
                            FETCH DATA
                        </button>
                    </form>
                </div>
            </div>

            {/* Table Section */}
            <div className="space-y-6">
                {isLoading || isFetching ? (
                    <div className="bg-card rounded-4xl border border-border/50 p-20 flex flex-col items-center justify-center gap-4">
                        <Loader text="Generating Financial Data..." />
                        <p className="text-muted-foreground text-sm animate-pulse">This may take a few moments</p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-6 duration-1000">
                        <PayoutDetailsTable payouts={payouts} />
                    </div>
                )}
            </div>
        </div>
    );
}
