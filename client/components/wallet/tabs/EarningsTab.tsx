"use client";
import React from 'react';
import { TrendingUp, Users, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Activity } from 'lucide-react';
import FormattedDate from '@/components/common/FormattedDate';
import Loader from '@/components/common/Loader';
import EarningsChart from './EarningsChart';

interface EarningsTabProps {
    payoutsData: any;
    isLoading: boolean;
    page: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const EarningsTab = ({ payoutsData, isLoading, page, onPageChange, pageSize, onPageSizeChange }: EarningsTabProps) => {
    const history = payoutsData?.data?.history?.data || [];
    const meta = payoutsData?.data?.history;
    const summary = payoutsData?.data?.summary;
    const serverPerPage = meta?.per_page || 10;
    const totalItems = meta?.total || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (isLoading) {
        return <Loader center text="Loading earnings history..." className="py-8" />;
    }

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
            <EarningsChart history={history} />

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
};

export default React.memo(EarningsTab);
