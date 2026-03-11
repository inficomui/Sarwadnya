"use client";
import React from 'react';
import { FileText, Loader2, PieChart, TrendingUp } from 'lucide-react';
import RefreshButton from '@/components/common/RefreshButton';
import FormattedDate from '@/components/common/FormattedDate';

interface InvestmentHistoryProps {
    transfers: any[];
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
    onPreviewImage: (url: string, title: string) => void;
}

const InvestmentHistory = ({ transfers, isLoading, isFetching, refetch, onPreviewImage }: InvestmentHistoryProps) => {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    Investment History
                </h2>
                <RefreshButton onRefresh={refetch} isRefreshing={isLoading || isFetching} label="Refresh" />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                    <p>Loading your requests...</p>
                </div>
            ) : transfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                    <PieChart className="w-10 h-10 mb-4 opacity-20" />
                    <p>No investment requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {transfers.map((transfer) => (
                        <div key={transfer.id} className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${transfer.status === 'approved' ? 'bg-green-500/10 text-green-600' : transfer.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-foreground">₹{Number(transfer.amount).toLocaleString('en-IN')}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${transfer.status === 'approved' ? 'bg-green-500/10 text-green-600' : transfer.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                            {transfer.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80">{transfer.method}</p>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <FormattedDate
                                            date={transfer.created_at}
                                            options={{ year: 'numeric', month: '2-digit', day: '2-digit' }}
                                        />
                                        <span>at</span>
                                        <FormattedDate
                                            date={transfer.created_at}
                                            options={{ hour: '2-digit', minute: '2-digit', second: '2-digit' }}
                                        />
                                        {transfer.reference_id && <><span className="w-1 h-1 rounded-full bg-border"></span><span className="font-mono">Ref: {transfer.reference_id}</span></>}
                                    </p>
                                    {transfer.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{transfer.notes}"</p>}
                                    {transfer.receipt_image && (
                                        <button onClick={() => onPreviewImage(transfer.receipt_image as string, `Receipt: ₹${Number(transfer.amount).toLocaleString('en-IN')}`)} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                            <FileText className="w-3 h-3" /> View Receipt
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(InvestmentHistory);
