"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Image as ImageIcon, Eye } from "lucide-react";
import { useGetPendingWalletRequestsQuery, useProcessWalletRequestMutation } from '@/redux/apies/walletApi';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import FormattedDate from '@/components/common/FormattedDate';
import toast from 'react-hot-toast';
import { AdminTable } from "@/components/admin/AdminTable";
import Image from 'next/image';

export default function WalletRequestsPage() {
    const { adminUser } = useAdminAuth();

    // Query Params
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset to page 1 when perPage changes
    useEffect(() => {
        setPage(1);
    }, [perPage]);

    // API Hooks
    const { data: requestsData, isLoading, isFetching, refetch } = useGetPendingWalletRequestsQuery({
        page,
        per_page: perPage,
        search: debouncedSearch
    });
    const [processRequest, { isLoading: isProcessing }] = useProcessWalletRequestMutation();

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            await processRequest({ id, action }).unwrap();
            toast.success(`Request ${action}ed successfully`);
            refetch();
        } catch (error: any) {
            console.error("Failed to process request:", error);
            const msg = error?.data?.message || "Failed to process request";
            toast.error(msg);
        }
    };

    if (!adminUser) return null;

    // Extract the actual requests array from the paginated response
    const requests = Array.isArray(requestsData?.data?.data) ? requestsData.data.data : [];

    // Define table columns
    const columns = [
        {
            key: "id",
            label: "#",
            render: (request: any) => <span className="text-muted-foreground">#{request.id}</span>
        },
        {
            key: "user",
            label: "User",
            render: (request: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                        {request.user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-foreground">{request.user.name}</div>
                        <div className="text-xs text-muted-foreground">{request.user.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: "amount",
            label: "Amount",
            render: (request: any) => (
                <span className="font-bold text-green-600 dark:text-green-400">
                    ₹{Number(request.amount).toLocaleString('en-IN')}
                </span>
            )
        },
        {
            key: "type",
            label: "Type",
            render: (request: any) => (
                <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm font-medium capitalize">{request.type || 'Topup'}</span>
                    {request.description && (
                        <span className="text-xs text-muted-foreground truncate" title={request.description}>
                            {request.description}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: "created_at",
            label: "Date",
            render: (request: any) => (
                <span className="text-muted-foreground">
                    <FormattedDate date={request.created_at} />
                </span>
            )
        },
        {
            key: "receipt",
            label: "Receipt",
            render: (request: any) => (
                request.receipt ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Receipt">
                                <Eye size={16} className="text-blue-500" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl justify-center flex">
                            <div className="relative w-full h-[500px]">
                                <Image
                                    src={request.receipt.startsWith('http') ? request.receipt : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${request.receipt}`}
                                    alt="Receipt"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <span className="text-xs text-muted-foreground italic">No receipt</span>
                )
            )
        },
        {
            key: "status",
            label: "Status",
            render: (request: any) => (
                <Badge
                    variant="outline"
                    className={`${request.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                        : request.status === 'approved'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}
                >
                    {request.status}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (request: any) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        onClick={() => handleAction(request.id, 'approve')}
                        variant="success"
                        size="icon"
                        title="Approve"
                        disabled={isProcessing || request.status !== 'pending'}
                    >
                        <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => handleAction(request.id, 'reject')}
                        variant="danger"
                        size="icon"
                        title="Reject"
                        disabled={isProcessing || request.status !== 'pending'}
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AdminTable
            // Header
            title="Wallet Top-up Requests"
            subtitle="Manage pending wallet top-up requests from users."

            // Search
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search requests..."

            // Table
            columns={columns}
            data={requests}
            keyExtractor={(request: any) => request.id.toString()}
            isLoading={isLoading}
            isFetching={isFetching}
            emptyMessage="No wallet requests found."

            // Pagination
            currentPage={requestsData?.data?.current_page || 1}
            lastPage={requestsData?.data?.last_page || 1}
            from={requestsData?.data?.from || 0}
            to={requestsData?.data?.to || 0}
            total={requestsData?.data?.total || 0}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            hasNextPage={!!requestsData?.data?.next_page_url}
            hasPrevPage={!!requestsData?.data?.prev_page_url}
            itemName="requests"
            onRefresh={refetch}
        />
    );
}
