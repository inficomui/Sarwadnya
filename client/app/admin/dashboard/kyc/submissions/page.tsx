"use client";

import React, { useState, useEffect } from "react";
import {
    Loader2,
    RefreshCw,
    XCircle,
    Eye,
    Shield,
    FileText
} from "lucide-react";
import { useGetAdminKycSubmissionsQuery, useUpdateAdminKycStatusMutation } from "@/redux/apies/kycApi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import type { KycSubmission } from "@/lib/types";
import RefreshButton from "@/components/common/RefreshButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function KycSubmissionsPage() {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<any>(null);

    // API Hooks
    const { data: submissions, isLoading, isFetching, refetch } = useGetAdminKycSubmissionsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminKycStatusMutation();

    // Local State
    const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const adminUserStr = localStorage.getItem("adminUser");
            if (adminUserStr) {
                try {
                    setAdminUser(JSON.parse(adminUserStr));
                } catch (error) {
                    console.error("Error parsing admin user data:", error);
                }
            }
        }
    }, [router]);

    const handleUpdateStatus = async () => {
        if (!selectedSubmission || !actionType) return;

        try {
            await updateStatus({
                id: selectedSubmission.id,
                status: actionType === 'approve' ? 'approved' : 'rejected',
                admin_message: actionType === 'reject' ? rejectReason : undefined
            }).unwrap();

            toast.success(`KYC ${actionType === 'approve' ? 'Approved' : 'Rejected'} successfully`);
            setSelectedSubmission(null);
            setActionType(null);
            setRejectReason("");
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update status");
        }
    };

    if (!adminUser) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">KYC Submissions</h1>
                    <p className="text-muted-foreground text-sm">Review and verify user KYC documents.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-card border border-border rounded-xl p-4 flex justify-end items-center shadow-sm">
                <RefreshButton
                    onRefresh={refetch}
                    isRefreshing={isFetching}
                    label="Refresh"
                />
            </div>

            {/* Submissions Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative min-h-[400px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">User ID</th>
                                <th className="px-6 py-4 font-medium">User Name</th>
                                <th className="px-6 py-4 font-medium">Submitted At</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {submissions?.map((sub) => (
                                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{sub.user_id}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{sub?.user?.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {sub.created_at ? new Date(sub.created_at).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize
                                            ${sub.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                sub.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedSubmission(sub)}
                                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Review
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {submissions?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No pending submissions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-primary" />
                                    KYC Verification
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Reviewing submission for <span className="font-semibold text-foreground">{selectedSubmission.user?.name || 'User'}</span> ({selectedSubmission.user_id})</p>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => { setSelectedSubmission(null); setActionType(null); }}
                                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Close Review</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full divide-y lg:divide-y-0 lg:divide-x divide-border">
                                {/* Left Panel: Data & Info */}
                                <div className="p-6 space-y-8 bg-muted/10">
                                    {/* Submission Info */}
                                    <div>
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Submission Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between py-2 border-b border-border/50">
                                                <span className="text-sm text-muted-foreground">Status</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                                                    ${selectedSubmission.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        selectedSubmission.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                    {selectedSubmission.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border/50">
                                                <span className="text-sm text-muted-foreground">Submitted At</span>
                                                <span className="text-sm font-medium">
                                                    {selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            {/* Add more user info if available from API */}
                                        </div>
                                    </div>

                                    {/* Text Data Fields */}
                                    {selectedSubmission.data && Object.keys(selectedSubmission.data).length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Form Data</h3>
                                            <div className="space-y-4">
                                                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                                                    <div key={key} className="bg-background border border-border rounded-lg p-3 shadow-sm">
                                                        <p className="text-xs text-muted-foreground mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                                                        <p className="font-medium text-sm wrap-break-word">{String(value)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Panel: Documents */}
                                <div className="lg:col-span-2 p-6 bg-card flex flex-col h-full">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Attached Documents
                                    </h3>

                                    {selectedSubmission.files && Object.keys(selectedSubmission.files).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                            {Object.entries(selectedSubmission.files).map(([key, url]) => {
                                                const fullUrl = getImageUrl(url);
                                                const isImage = fullUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                                return (
                                                    <div key={key} className="bg-background rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                                                        <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                                                            <h4 className="font-semibold text-sm capitalize truncate max-w-[150px]" title={key.replace(/_/g, ' ')}>
                                                                {key.replace(/_/g, ' ')}
                                                            </h4>
                                                            <div className="flex gap-1">
                                                                <a
                                                                    href={fullUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-primary rounded-md transition-colors"
                                                                    title="Open in new tab"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </a>
                                                                <a
                                                                    href={fullUrl}
                                                                    download
                                                                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-primary rounded-md transition-colors"
                                                                    title="Download"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" /><line x1="12" x2="12" y1="3" /></svg>
                                                                </a>
                                                            </div>
                                                        </div>

                                                        {isImage ? (
                                                            <div
                                                                className="relative aspect-video bg-black/5 cursor-zoom-in overflow-hidden group-hover:opacity-95 transition-opacity"
                                                                onClick={() => setPreviewImage(fullUrl)}
                                                            >
                                                                <img
                                                                    src={fullUrl}
                                                                    alt={key}
                                                                    className="w-full h-full object-contain"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">Click to Zoom</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-video bg-muted/20 flex flex-col items-center justify-center p-6 text-muted-foreground">
                                                                <FileText className="w-12 h-12 mb-2 opacity-50" />
                                                                <span className="text-xs uppercase font-medium tracking-wider">Document File</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border h-full">
                                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No documents attached</p>
                                            <p className="text-sm">This submission contains no file uploads.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                {actionType ? (
                                    <span className="text-foreground font-medium">Please confirm your action below.</span>
                                ) : (
                                    <span>Take action on this KYC submission.</span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {!actionType ? (
                                    <>
                                        <Button variant="outline" onClick={() => { setSelectedSubmission(null); setActionType(null); }}>
                                            Close
                                        </Button>
                                        {selectedSubmission.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => setActionType('reject')}
                                                >
                                                    Reject Application
                                                </Button>
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                                    onClick={() => setActionType('approve')}
                                                >
                                                    Approve Application
                                                </Button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full">
                                        {actionType === 'reject' && (
                                            <div className="w-full sm:w-80">
                                                <input
                                                    type="text"
                                                    placeholder="Reason for rejection (required)..."
                                                    className="w-full bg-background border border-destructive/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2 shrink-0">
                                            <Button variant="ghost" onClick={() => { setActionType(null); setRejectReason(""); }}>Cancel</Button>
                                            <Button
                                                variant={actionType === 'reject' ? 'destructive' : 'default'}
                                                className={actionType === 'approve' ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                                onClick={handleUpdateStatus}
                                                disabled={isUpdating || (actionType === 'reject' && !rejectReason.trim())}
                                            >
                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                    actionType === 'reject' ? <XCircle className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />
                                                )}
                                                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image Preview Overlay */}
                    {previewImage && (
                        <div
                            className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setPreviewImage(null)}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
                                        onClick={() => setPreviewImage(null)}
                                    >
                                        <XCircle className="w-8 h-8" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Close Preview</p>
                                </TooltipContent>
                            </Tooltip>
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-[95vw] max-h-[95vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}