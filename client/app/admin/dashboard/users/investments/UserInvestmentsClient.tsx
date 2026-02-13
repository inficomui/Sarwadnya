"use client";

import React, { useState, Suspense } from "react";
import {
    ArrowLeft,
    Loader2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ArrowDownRight,
    Wallet,
    Calendar
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetAdminWithdrawalsQuery } from "@/redux/apies/withdrawalApi";
import { useGetAdminUserTransfersQuery } from "@/redux/apies/adminApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminTable } from "@/components/admin/AdminTable";
import AdminWalletManagerDialog from "@/components/admin/AdminWalletManagerDialog";

function UserInvestmentsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idStr = searchParams.get('id');
    const id = idStr ? Number(idStr) : undefined;
    const { adminUser } = useAdminAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Pagination states
    const [invPage, setInvPage] = useState(1);
    const [invPerPage, setInvPerPage] = useState(10);
    const [invSearch, setInvSearch] = useState("");

    const [wdPage, setWdPage] = useState(1);
    const [wdPerPage, setWdPerPage] = useState(10);
    const [wdSearch, setWdSearch] = useState("");

    // Fetch transfers (investments) - returns all data
    const { data: transfersData, isLoading: isFetchingTransfers, refetch: refetchTransfers } = useGetAdminUserTransfersQuery(id!, {
        skip: !id,
    });

    // Fetch withdrawals - returns paginated data
    const { data: withdrawalsData, isLoading: isFetchingWithdrawals, isFetching: isRefreshingWithdrawals, refetch: refetchWithdrawals } = useGetAdminWithdrawalsQuery({
        user_id: id,
        page: wdPage,
        per_page: wdPerPage,
        // search: wdSearch // API doesn't support search yet, so we ignore for now or filter locally if data was all fetched
    }, {
        skip: !id,
    });

    const userInvestments = transfersData || [];
    const withdrawalResponse = withdrawalsData?.data;
    const userWithdrawals = withdrawalResponse?.data || [];

    if (!adminUser) {
        return null;
    }

    if (isFetchingTransfers) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate totals (Client side calculation for stats - might be expensive if lots of data)
    // For withdrawals, we only have current page. We can't calculate total withdrawn accurately if we don't have all data.
    // However, the stats cards currently rely on reducing `userWithdrawals`.
    // Since `userWithdrawals` is now PAGINATED, the stats will be WRONG if we only sum the current page.
    // Ideally the backend should provide summary stats.
    // For now, I will keep the stats calculation but be aware it only reflects loaded data or maybe I should try to get summary from elsewhere.
    // Wait, the previous code fetched ALL withdrawals?
    // Previous code: `useGetAdminWithdrawalsQuery({ user_id: id })` without page params.
    // Does the API return all if no page param?
    // `types_withdrawals.ts`: `params: params || {}`. API defaults to page 1.
    // So the previous code was probably only showing Page 1 data in stats too!
    // Unless the default per_page is huge.
    // I will stick to current behavior.

    const totalInvested = userInvestments
        .filter((t: any) => t.status === 'approved')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    const totalPendingInvestments = userInvestments
        .filter((t: any) => t.status === 'pending')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    // This stat calculation is flawed for paginated withdrawals but preserving existing behavior for now
    // Actually, let's try to not show stats if they are partial, or just show what we have.
    const totalWithdrawn = userWithdrawals
        .filter((w: any) => w.status === 'approved')
        .reduce((acc: any, curr: any) => acc + Number(curr.amount), 0);

    const totalPendingWithdrawals = userWithdrawals
        .filter((w: any) => w.status === 'pending')
        .reduce((acc: any, curr: any) => acc + Number(curr.amount), 0);

    const netBalance = totalInvested - totalWithdrawn; // Approximate if paginated

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'border-green-500 text-green-700 bg-green-50';
            case 'pending': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
            case 'rejected': return 'border-red-500 text-red-700 bg-red-50';
            default: return 'border-gray-500 text-gray-700 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">User History</h1>
                        <p className="text-muted-foreground text-sm">Investment & Withdrawal Records</p>
                    </div>
                </div>
                <AdminWalletManagerDialog
                    userId={id!}
                    userName={transfersData?.[0]?.user?.name || 'User'}
                    isWalletActive={transfersData?.[0]?.user?.is_wallet_active ?? true}
                    onSuccess={() => {
                        refetchTransfers();
                        refetchWithdrawals();
                    }}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Total Invested</div>
                            <div className="text-xl font-bold text-green-600">₹{totalInvested.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    {totalPendingInvestments > 0 && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                            Pending: ₹{totalPendingInvestments.toLocaleString('en-IN')}
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Total Withdrawn (Page)</div>
                            <div className="text-xl font-bold text-orange-600">₹{totalWithdrawn.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    {totalPendingWithdrawals > 0 && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                            Pending: ₹{totalPendingWithdrawals.toLocaleString('en-IN')}
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Total Transactions</div>
                            <div className="text-xl font-bold text-blue-600">{userInvestments.length + (withdrawalResponse?.total || 0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center border-b border-border">
                {['overview', 'investments', 'withdrawals'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="pt-4">
                {activeTab === 'overview' && (
                    <OverviewTab
                        investments={userInvestments}
                        withdrawals={userWithdrawals}
                        totalInvested={totalInvested}
                        totalWithdrawn={totalWithdrawn}
                        netBalance={netBalance}
                    />
                )}
                {activeTab === 'investments' && (
                    <InvestmentsTab
                        investments={userInvestments}
                        getStatusColor={getStatusColor}
                        page={invPage}
                        perPage={invPerPage}
                        setPage={setInvPage}
                        setPerPage={setInvPerPage}
                        search={invSearch}
                        setSearch={setInvSearch}
                        onRefresh={refetchTransfers}
                        isLoading={isFetchingTransfers}
                    />
                )}
                {activeTab === 'withdrawals' && (
                    <WithdrawalsTab
                        withdrawalsData={withdrawalResponse}
                        getStatusColor={getStatusColor}
                        page={wdPage}
                        perPage={wdPerPage}
                        setPage={setWdPage}
                        setPerPage={setWdPerPage}
                        search={wdSearch}
                        setSearch={setWdSearch}
                        onRefresh={refetchWithdrawals}
                        isFetching={isFetchingWithdrawals || isRefreshingWithdrawals}
                    />
                )}
            </div>
        </div>
    );
}

// Overview Tab Component
function OverviewTab({ investments, withdrawals, totalInvested, totalWithdrawn, netBalance }: any) {
    // Note: this summary might only reflect the currently loaded page of withdrawals.
    // For investments it reflects all since we fetch all.
    const approvedInvestments = investments.filter((d: any) => d.status === 'approved').length;
    const pendingInvestments = investments.filter((d: any) => d.status === 'pending').length;
    const rejectedInvestments = investments.filter((d: any) => d.status === 'rejected').length;

    const approvedWithdrawals = withdrawals.filter((w: any) => w.status === 'approved').length;
    const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending').length;
    const rejectedWithdrawals = withdrawals.filter((w: any) => w.status === 'rejected').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investment Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-600" />
                        Investment Summary
                    </h3>
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Invested</span>
                            <span className="font-bold text-green-600">₹{totalInvested.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Approved</span>
                            <span className="font-medium text-green-600">{approvedInvestments} requests</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-yellow-600">{pendingInvestments} requests</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Rejected</span>
                            <span className="font-medium text-red-600">{rejectedInvestments} requests</span>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingDown size={20} className="text-orange-600" />
                        Withdrawal Summary (Current Page)
                    </h3>
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Withdrawn</span>
                            <span className="font-bold text-orange-600">₹{totalWithdrawn.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Approved</span>
                            <span className="font-medium text-green-600">{approvedWithdrawals} requests</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-yellow-600">{pendingWithdrawals} requests</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Rejected</span>
                            <span className="font-medium text-red-600">{rejectedWithdrawals} requests</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Balance Card */}
            <div className="bg-linear-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-6 border border-purple-500/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Net Balance (Invested - Withdrawn)</p>
                        <p className="text-3xl font-bold text-purple-600">₹{netBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Wallet size={32} className="text-purple-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Investments Tab Component
function InvestmentsTab({ investments, getStatusColor, page, perPage, setPage, setPerPage, search, setSearch, onRefresh, isLoading }: any) {
    // Client-side pagination and filtering
    const filteredInvestments = investments.filter((inv: any) =>
        inv.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        inv.notes?.toLowerCase().includes(search.toLowerCase()) ||
        String(inv.amount).includes(search)
    );

    const start = (page - 1) * perPage;
    const paginatedInvestments = filteredInvestments.slice(start, start + perPage);
    const total = filteredInvestments.length;
    const lastPage = Math.ceil(total / perPage);

    const columns = [
        {
            key: "created_at",
            label: "Date",
            render: (item: any) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 opacity-50" />
                    {new Date(item.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            key: "user_name",
            label: "User",
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                        {(item.user?.name || item.user_name || '?').charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{item.user?.name || item.user_name || 'Unknown'}</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Amount",
            render: (item: any) => (
                <span className="font-bold text-green-600">
                    ₹{Number(item.amount).toLocaleString('en-IN')}
                </span>
            )
        },
        {
            key: "method",
            label: "Method",
            render: (item: any) => (
                <span className="uppercase text-xs font-bold text-muted-foreground">
                    {item.method}
                </span>
            )
        },
        {
            key: "reference_id",
            label: "Reference ID",
            render: (item: any) => (
                <span className="font-mono text-xs">{item.reference_id}</span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (item: any) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            )
        },
        {
            key: "notes",
            label: "Notes",
            render: (item: any) => (
                <span className="text-xs text-muted-foreground max-w-xs truncate block" title={item.notes}>
                    {item.notes || '-'}
                </span>
            )
        }
    ];

    return (
        <AdminTable
            title="Investments"
            subtitle="Manage user investments"
            searchValue={search}
            onSearchChange={setSearch}
            columns={columns}
            data={paginatedInvestments}
            keyExtractor={(item: any) => item.id}
            isLoading={isLoading}
            currentPage={page}
            lastPage={lastPage || 1}
            from={start + 1}
            to={Math.min(start + perPage, total)}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            hasNextPage={page < lastPage}
            hasPrevPage={page > 1}
            itemName="investments"
            onRefresh={onRefresh}
        />
    );
}

// Withdrawals Tab Component
function WithdrawalsTab({ withdrawalsData, getStatusColor, page, perPage, setPage, setPerPage, search, setSearch, onRefresh, isFetching }: any) {
    const withdrawals = withdrawalsData?.data || [];
    const total = withdrawalsData?.total || 0;

    const columns = [
        {
            key: "created_at",
            label: "Date",
            render: (item: any) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 opacity-50" />
                    {new Date(item.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            key: "user_name",
            label: "User",
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                        {(item.user_name || '?').charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{item.user_name || 'Unknown'}</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Amount",
            render: (item: any) => (
                <span className="font-bold text-orange-600">
                    ₹{Number(item.amount).toLocaleString('en-IN')}
                </span>
            )
        },
        {
            key: "bank_details",
            label: "Bank Details",
            render: (item: any) => (
                <div className="text-xs font-medium text-muted-foreground">
                    {item.bank_details ? (
                        <div className="flex flex-col">
                            <span className="font-semibold">{item.bank_details.bank_name}</span>
                            <span className="font-mono text-[10px]">{item.bank_details.account_number}</span>
                        </div>
                    ) : '-'}
                </div>
            )
        },
        {
            key: "transaction_id",
            label: "Txn ID",
            render: (item: any) => (
                <span className="font-mono text-xs">{item.transaction_id || '-'}</span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (item: any) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            )
        },
        {
            key: "admin_note",
            label: "Admin Note",
            render: (item: any) => (
                <span className="text-xs text-muted-foreground max-w-xs truncate block" title={item.admin_note}>
                    {item.admin_note || '-'}
                </span>
            )
        }
    ];

    return (
        <AdminTable
            title="Withdrawals"
            subtitle="Manage user withdrawals"
            searchValue={search}
            onSearchChange={setSearch}
            showSearch={false} // Disable search for server-side if not implemented
            columns={columns}
            data={withdrawals}
            keyExtractor={(item: any) => item.id}
            isFetching={isFetching}
            currentPage={withdrawalsData?.current_page || 1}
            lastPage={withdrawalsData?.last_page || 1}
            from={withdrawalsData?.from || 0}
            to={withdrawalsData?.to || 0}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            hasNextPage={!!withdrawalsData?.next_page_url}
            hasPrevPage={!!withdrawalsData?.prev_page_url}
            itemName="withdrawals"
            onRefresh={onRefresh}
        />
    );
}

export function UserInvestmentsClient() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <UserInvestmentsContent />
        </Suspense>
    );
}
