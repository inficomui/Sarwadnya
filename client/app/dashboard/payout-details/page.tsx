"use client";
// Triggering rebuild
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetPayoutsByRangeQuery } from '@/redux/apies/payoutApi';
import { Calendar, Search, FileText, Filter, Rocket, ChevronDown, X } from 'lucide-react';
import Loader from '@/components/common/Loader';
import RefreshButton from '@/components/common/RefreshButton';
import PayoutDetailsTable from '@/components/dashboard/PayoutDetailsTable';

export default function PayoutDetailsPage() {
    const { user } = useAuth();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isSearchTriggered, setIsSearchTriggered] = useState(true); // Default to true to load all data initially

    const { data: payoutsData, isLoading, isFetching, refetch } = useGetPayoutsByRangeQuery(
        {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            type: filterType !== "all" ? filterType : undefined,
            status: filterStatus !== "all" ? filterStatus : undefined
        },
        {
            skip: !isSearchTriggered,
            refetchOnMountOrArgChange: true,
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

    const payouts = React.useMemo(() => {
        const data = payoutsData?.data || [];
        return [...data].sort((a, b) => {
            const dateA = new Date(a.payout_date || a.created_at).getTime();
            const dateB = new Date(b.payout_date || b.created_at).getTime();
            return dateA - dateB;
        });
    }, [payoutsData]);

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
                <div className="bg-card p-6 rounded-4xl border border-border shadow-sm space-y-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Statistical Period Start</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 h-12 bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none transition-all font-medium text-slate-700 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Statistical Period End</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 h-12 bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none transition-all font-medium text-slate-700 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Payout Type</label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                <select 
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full pl-10 pr-10 h-12 bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none appearance-none transition-all font-medium text-slate-700 text-sm cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    <option value="roi">ROI (Self Bonus)</option>
                                    <option value="referral">Level Bonus</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Status</label>
                            <div className="relative">
                                <Rocket className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                <select 
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-10 pr-10 h-12 bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none appearance-none transition-all font-medium text-slate-700 text-sm cursor-pointer"
                                >
                                    <option value="all">Any Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Unmatured">Unmatured</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="h-12 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Search size={18} strokeWidth={3} />
                            FETCH DATA
                        </button>
                    </form>

                    {(startDate || endDate || filterType !== 'all' || filterStatus !== 'all') && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                            <button
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                    setFilterType("all");
                                    setFilterStatus("all");
                                }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors"
                            >
                                <X size={12} /> Clear Filters
                            </button>
                            {filterType !== 'all' && <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase">{filterType === 'roi' ? 'Self Bonus' : 'Level Bonus'}</span>}
                            {filterStatus !== 'all' && <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold uppercase">{filterStatus}</span>}
                        </div>
                    )}
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
