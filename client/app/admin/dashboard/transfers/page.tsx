"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Search, Filter, Check, X, Eye, Download, FileText, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAdminTransfersQuery, useUpdateAdminTransferStatusMutation, useDeleteInvestmentMutation } from "@/redux/apies/adminApi";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { AdminUser, Transfer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import RefreshButton from "@/components/common/RefreshButton";
import TableActionButton from "@/components/common/TableActionButton";
import FormattedDate from "@/components/common/FormattedDate";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function TransfersPage() {
    const router = useRouter();
    // Local State
    const [search, setSearch] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleViewSchedule = (id: number) => {
        router.push(`/admin/dashboard/transfers/view?id=${id}`);
    };

    // API Hooks
    const { data, isLoading, isFetching, refetch } = useGetAdminTransfersQuery();
    const transfers = data;
    const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminTransferStatusMutation();
    const [deleteInvestment, { isLoading: isDeleting }] = useDeleteInvestmentMutation();

    const { adminUser } = useAdminAuth();

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this investment?`)) return;

        try {
            await updateStatus({ id, status }).unwrap();
            // Optional: Show success toast
        } catch (error) {
            console.error(`Failed to ${status} investment`, error);
            // Optional: Show error toast
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to DELETE this investment?\n\nThis will remove all related data including:\n- Investment details\n- Payout schedules\n- Referral commissions\n- Wallet transactions\n\nThis action cannot be undone!")) return;

        try {
            await deleteInvestment(id).unwrap();
            // Optional: Show success toast
        } catch (error) {
            console.error("Failed to delete investment", error);
        }
    };

    // Filter transfers based on search
    const filteredTransfers = transfers?.filter((t: Transfer) =>
        t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.amount.toString().includes(search) ||
        t.reference_id?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewImage = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    // Helper to get full image URL
    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}${path.startsWith('/') ? '' : '/storage/'}${path}`;
    };

    const handleDownloadImage = async (imageUrl: string, filename: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'receipt-image';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
            // Fallback: execute simpler open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    if (!adminUser) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">Investment Requests</h1>
                    <p className="text-muted-foreground text-sm">Manage and review all user investment requests.</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-card border border-border rounded-xl p-4 flex md:flex-row gap-4 justify-between items-center shadow-sm">
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

                <div className="flex items-center gap-2">
                    <RefreshButton
                        onRefresh={refetch}
                        isRefreshing={isFetching}
                        label="Refresh"
                    />
                </div>
            </div>

            {/* Investments Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">#</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Method</th>
                                <th className="px-6 py-4 font-medium">Reference ID</th>
                                <th className="px-6 py-4 font-medium">Receipt</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right sticky right-0 bg-muted/50 dark:bg-muted z-20 backdrop-blur-none shadow-[-5px_0px_10px_-5px_gba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(isLoading || isFetching || isUpdating) ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12">
                                        <div className="flex items-center justify-center min-h-[400px]">
                                            <Loader text="Loading investments..." />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {currentTransfers?.map((transfer: Transfer) => (
                                        <tr key={transfer.id} className="hover:bg-accent transition-colors border-b border-border group">
                                            <td className="px-6 py-4">{transfer.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{transfer.user?.name || transfer.user_name || "Unknown"}</span>
                                                    <span className="text-xs text-muted-foreground">{transfer.user?.email || transfer.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-foreground">
                                                ₹{parseFloat(transfer.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-foreground/80 capitalize">
                                                {transfer.method || "Investment"}
                                            </td>
                                            <td className="px-6 py-4 text-foreground/80 font-mono text-xs">
                                                {transfer.reference_id || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {transfer.receipt_image ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => handleViewImage(getImageUrl(transfer.receipt_image!)!)}
                                                                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-md border border-primary/10"
                                                            >
                                                                <FileText size={14} />
                                                                View Receipt
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View payment receipt</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No receipt</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <FormattedDate date={transfer.created_at} />
                                                <div className="text-[10px]"><FormattedDate date={transfer.created_at} options={{ hour: 'numeric', minute: 'numeric', second: 'numeric' }} /></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${transfer.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                    transfer.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                                    }`}>
                                                    {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right sticky right-0 bg-card group-hover:bg-accent z-10 shadow-[-5px_0px_10px_-5px_gba(0,0,0,0.1)] transition-colors">
                                                <div className="flex items-center justify-end gap-2">
                                                    <TableActionButton
                                                        onClick={() => {
                                                            if (transfer.investment?.id) {
                                                                handleViewSchedule(transfer.investment.id);
                                                            }
                                                        }}
                                                        disabled={!transfer.investment?.id}
                                                        icon={Eye}
                                                        label="View Schedule"
                                                    />
                                                    {transfer.status === 'pending' && (
                                                        <>
                                                            <TableActionButton
                                                                onClick={() => handleUpdateStatus(transfer.id, 'approved')}
                                                                icon={Check}
                                                                label="Approve"
                                                                variant="success"
                                                            />
                                                            <TableActionButton
                                                                onClick={() => handleUpdateStatus(transfer.id, 'rejected')}
                                                                icon={X}
                                                                label="Reject"
                                                                variant="destructive"
                                                            />
                                                        </>
                                                    )}
                                                    {transfer.status === 'approved' && (
                                                        <TableActionButton
                                                            onClick={() => handleDelete(transfer.id)}
                                                            icon={Trash2}
                                                            label="Delete"
                                                            variant="destructive"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransfers?.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                                No investment requests found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div >

            {/* Image Preview Dialog */}
            < Dialog open={!!selectedImage
            } onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none sm:max-w-4xl [&>button]:hidden focus:outline-none">
                    <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-md shadow-2xl ring-1 ring-border/50">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="font-semibold text-lg tracking-tight">Receipt Preview</h3>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => selectedImage && handleDownloadImage(selectedImage, 'receipt.jpg')}
                                            className="h-9 gap-2 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                                        >
                                            <Download size={15} />
                                            Download
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="top-20">
                                        <p>Download receipt image</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                            onClick={() => setSelectedImage(null)}
                                        >
                                            <X size={20} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Close preview</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="flex items-center justify-center p-8 bg-muted/20 dark:bg-muted/10 min-h-[500px]">
                            {selectedImage && (
                                <img
                                    src={selectedImage}
                                    alt="Receipt"
                                    className="max-h-[75vh] w-auto max-w-full rounded-lg shadow-lg object-contain bg-background/50"
                                />
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </div >
    );
}
