"use client";

import React, { useState } from 'react';
import { useGetAdminWithdrawalsQuery, useUpdateWithdrawalStatusMutation, useGetAdminWithdrawalDetailsQuery, useExportWithdrawalsMutation } from '@/redux/apies/withdrawalApi';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, XCircle, Clock, Search, Eye, Filter, Download } from 'lucide-react';
import FormattedDate from '@/components/common/FormattedDate';
import Loader from '@/components/common/Loader';
import RefreshButton from '@/components/common/RefreshButton';
import TableActionButton from '@/components/common/TableActionButton';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function AdminWithdrawalsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');
    const { data, isLoading, isFetching, refetch } = useGetAdminWithdrawalsQuery({
        page,
        status: statusFilter
    });

    // Status Update State
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [isactionModalOpen, setIsActionModalOpen] = useState(false);

    const [updateStatus, { isLoading: isUpdating }] = useUpdateWithdrawalStatusMutation();
    const [exportWithdrawals, { isLoading: isExporting }] = useExportWithdrawalsMutation();

    const { adminToken } = useAdminAuth();
    const { token: userToken } = useAuth();

    const handleAction = (withdrawal: any) => {
        setSelectedWithdrawal(withdrawal);
        setIsActionModalOpen(true);
    };

    const handleExport = async () => {
        // Try adminToken first, then fallback to user token
        const token = adminToken || userToken;

        if (!token) {
            console.error("No token found (checked adminToken and token)");
            toast.error("You are not authenticated");
            return;
        }

        try {
            const { blob, contentType } = await exportWithdrawals(token).unwrap();

            // Determine extension
            let extension = 'csv';
            if (contentType?.includes('sheet') || contentType?.includes('excel')) {
                extension = 'xlsx';
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pending_withdrawals.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Withdrawals exported successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export withdrawals");
        }
    };

    const handleUpdateStatus = async (status: 'approved' | 'rejected', notes: string, txId: string) => {
        if (!selectedWithdrawal) return;

        try {
            await updateStatus({
                id: selectedWithdrawal.id,
                status,
                admin_note: notes,
                transaction_id: txId
            }).unwrap();
            toast.success(`Withdrawal ${status} successfully`);
            setIsActionModalOpen(false);
            setSelectedWithdrawal(null);
        } catch (error: any) {
            // Error handled by RTK Query / Toast in base query usually
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-card rounded-xl border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Withdrawal Requests</h1>
                    <p className="text-muted-foreground mt-1">Manage user withdrawal requests</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        isLoading={isExporting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 border-none"
                    >
                        {!isExporting && <Download size={16} />}
                        Export Excel
                    </Button>
                    <RefreshButton
                        onRefresh={refetch}
                        isRefreshing={isFetching}
                        label="Refresh"
                        className="bg-secondary/50 hover:bg-secondary border-none"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                <Filter size={20} className="text-muted-foreground" />
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Stats Summary could go here */}

            {/* List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">ID & User</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Bank Details</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Requested At</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12">
                                        <Loader center text="Loading withdrawals..." />
                                    </td>
                                </tr>
                            ) : !data?.data?.data?.length ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No withdrawals found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                data.data.data.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs text-muted-foreground">#{item.id}</span>
                                                <span className="font-medium">{item.user?.name || item.user_name || 'User'}</span>
                                                <span className="text-xs text-muted-foreground">{item.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-foreground">₹{item.amount}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate">
                                            {item.bank_details ? (
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="font-medium">{item.bank_details.bank_name}</span>
                                                    <span>{item.bank_details.account_number}</span>
                                                    <span className="text-muted-foreground">{item.bank_details.ifsc_code}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">No details</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                item.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                                }`}>
                                                {item.status === 'approved' ? <CheckCircle2 size={12} /> :
                                                    item.status === 'rejected' ? <XCircle size={12} /> :
                                                        <Clock size={12} />}
                                                <span className="capitalize">{item.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <FormattedDate date={item.created_at} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <TableActionButton
                                                onClick={() => handleAction(item)}
                                                icon={Eye}
                                                label="View & Action"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.data && (
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                        <span className="text-sm text-muted-foreground">
                            Page {data.data.current_page} of {data.data.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={data.data.current_page === 1}
                                className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(data.data.last_page, p + 1))}
                                disabled={data.data.current_page === data.data.last_page}
                                className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {isactionModalOpen && selectedWithdrawal && (
                <ActionModal
                    withdrawal={selectedWithdrawal}
                    onClose={() => setIsActionModalOpen(false)}
                    onUpdate={handleUpdateStatus}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}

function ActionModal({ withdrawal: initialWithdrawal, onClose, onUpdate, isUpdating }: any) {
    const { data: detailResponse, isLoading: isLoadingDetails } = useGetAdminWithdrawalDetailsQuery(initialWithdrawal.id);
    const withdrawal = detailResponse?.data || initialWithdrawal;
    const summary = detailResponse?.summary;

    const [action, setAction] = useState<'approved' | 'rejected'>('approved');
    const [note, setNote] = useState('');
    const [txId, setTxId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(action, note, txId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold">Process Withdrawal #{withdrawal.id}</h3>
                        <p className="text-xs text-muted-foreground">Request from {withdrawal.user?.name || withdrawal.user_name}</p>
                    </div>

                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {isLoadingDetails ? (
                        <Loader center text="Loading detailed breakdown..." className="py-12" />
                    ) : (
                        <>
                            {/* Summary Cards */}
                            {summary && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Total ROI</p>
                                        <p className="font-semibold text-primary">₹{summary.total_roi_amount}</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Total Referral</p>
                                        <p className="font-semibold text-primary">₹{summary.total_referral_amount}</p>
                                    </div>
                                    <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">TDS (Deduction)</p>
                                        <p className="font-semibold text-orange-600">-₹{summary.total_tds}</p>
                                    </div>
                                    <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Admin Charges</p>
                                        <p className="font-semibold text-orange-600">-₹{summary.total_admin_charges}</p>
                                    </div>
                                </div>
                            )}

                            {/* Main Amount & Bank */}
                            <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Payable Amount</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        ₹{summary?.net_payable || withdrawal.amount}
                                    </p>
                                </div>
                                <div className="flex-1 border-l border-border pl-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Banking Details</p>
                                    {withdrawal.bank_details ? (
                                        <div className="text-sm space-y-0.5">
                                            <p className="font-medium">{withdrawal.bank_details.bank_name}</p>
                                            <p className="font-mono">{withdrawal.bank_details.account_number}</p>
                                            <p className="text-muted-foreground text-xs">{withdrawal.bank_details.ifsc_code}</p>
                                        </div>
                                    ) : <p className="text-sm italic text-muted-foreground">No bank details attached</p>}
                                </div>
                            </div>

                            {/* Action Form */}
                            {withdrawal.status === 'pending' ? (
                                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                                    <div className="border-t border-border pt-4">
                                        <label className="block text-sm font-medium mb-3">Authorize Action</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${action === 'approved' ? 'bg-green-500/5 border-green-500 text-green-700' : 'border-border hover:bg-muted/50'}`}>
                                                <input type="radio" name="action" value="approved" checked={action === 'approved'} onChange={() => setAction('approved')} className="hidden" />
                                                <CheckCircle2 size={24} />
                                                <span className="font-semibold">Approve & Pay</span>
                                            </label>
                                            <label className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${action === 'rejected' ? 'bg-red-500/5 border-red-500 text-red-700' : 'border-border hover:bg-muted/50'}`}>
                                                <input type="radio" name="action" value="rejected" checked={action === 'rejected'} onChange={() => setAction('rejected')} className="hidden" />
                                                <XCircle size={24} />
                                                <span className="font-semibold">Reject Request</span>
                                            </label>
                                        </div>
                                    </div>

                                    {action === 'approved' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-sm font-medium mb-1.5">Bank Transaction ID <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required={action === 'approved'}
                                                value={txId}
                                                onChange={(e) => setTxId(e.target.value)}
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="e.g. UTR Number / Ref ID"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Provide the reference number from your bank transfer.</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Admin Note <span className="text-muted-foreground font-normal">(Optional)</span></label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Add internal notes or reason for rejection..."
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isUpdating}
                                            isLoading={isUpdating}
                                            className={`w-full py-6 font-bold text-base shadow-sm transition-all ${action === 'approved'
                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 hover:shadow-green-500/30'
                                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:shadow-red-500/30'
                                                }`}
                                        >
                                            {action === 'approved' ? 'Confirm Payout' : 'Confirm Rejection'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className={`p-4 rounded-lg border text-center ${withdrawal.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-red-500/10 border-red-500/20 text-red-700'
                                    }`}>
                                    <p className="font-bold text-lg flex items-center justify-center gap-2">
                                        {withdrawal.status === 'approved' ? <CheckCircle2 /> : <XCircle />}
                                        Request {withdrawal.status === 'approved' ? 'Approved' : 'Rejected'}
                                    </p>
                                    {withdrawal.transaction_id && <div className="mt-2 text-sm bg-background/50 inline-block px-3 py-1 rounded border border-border/50">Tx ID: {withdrawal.transaction_id}</div>}
                                    {withdrawal.admin_note && <p className="text-sm mt-2 opacity-90">"{withdrawal.admin_note}"</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
