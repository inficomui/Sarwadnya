"use client";

import React, { useState } from 'react';
import { WalletTransaction } from '@/lib/types/wallet';
import FormattedDate from '@/components/common/FormattedDate';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    FileText,
    Users
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';

interface WalletTransactionsProps {
    transactions: WalletTransaction[];
    isLoading?: boolean;
}

export default function WalletTransactions({ transactions = [], isLoading }: WalletTransactionsProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
    const pageSize = 10;

    // Client-side filtering
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const filteredTransactions = safeTransactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.amount.toString().includes(search) ||
            t.id.toString().includes(search);

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'completed'
                ? t.status === 'approved'
                : t.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const displayedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (isLoading && transactions.length === 0) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading transactions...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={20} className="text-muted-foreground" />
                    Transaction History
                </h3>

                <div className="flex items-center gap-2">
                    <div className="flex p-1 bg-muted/40 rounded-lg border border-border/50">
                        {['all', 'pending', 'completed'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => { setStatusFilter(filter as any); setPage(1); }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${statusFilter === filter
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-8 h-8 text-xs bg-muted/20"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {displayedTransactions.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border/50">
                        <ArrowUpRight size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No transactions found</p>
                    </div>
                ) : (
                    displayedTransactions.map((tx) => (
                        <div key={tx.id} className="bg-card border border-border/50 hover:border-primary/20 rounded-xl p-4 transition-all hover:bg-muted/30 group">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full shrink-0 ${tx.type === 'credit'
                                        ? 'bg-green-500/10 text-green-600'
                                        : 'bg-red-500/10 text-red-600'
                                        }`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{tx.description}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            {tx.related_user && (
                                                <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/30">
                                                    <Users size={10} />
                                                    <span>{tx.related_user.name}</span>
                                                    <span className="opacity-60 text-[10px]">#{tx.related_user.id}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock size={10} />
                                                <FormattedDate date={tx.created_at} />
                                            </div>
                                            <span className={`capitalize px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                                tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                                                    'bg-red-500/10 text-red-600'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold font-mono text-lg ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {Math.min(filteredTransactions.length, (page - 1) * pageSize + 1)} to {Math.min(filteredTransactions.length, page * pageSize)} of {totalItems} entries
                    </p>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(1)} disabled={page === 1}>
                            <ChevronsLeft size={14} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                            <ChevronLeft size={14} />
                        </Button>
                        <div className="flex items-center justify-center min-w-12 text-sm font-medium">
                            {page} / {totalPages}
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                            <ChevronRight size={14} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>
                            <ChevronsRight size={14} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
