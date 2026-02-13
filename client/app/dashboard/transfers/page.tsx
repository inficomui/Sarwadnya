"use client";
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTransferMutation, useGetMyTransfersQuery } from '@/redux/apies/transferApi';
import { useLazyGetPaymentDetailsQuery } from '@/redux/apies/paymentApi';
import { useInvestFromWalletMutation, useGetWalletQuery } from '@/redux/apies/walletApi';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';
import {
    LayoutDashboard,
    PieChart,
    Wallet,
    Settings,
    FileText,
    Users,
    ArrowLeftRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Copy,
    AlertCircle,
    RefreshCw,
    Building2,
    Coins,
    Info,
    Shield,
    TrendingUp,
    Upload,
    X,
    Maximize2
} from 'lucide-react';
import RefreshButton from '@/components/common/RefreshButton';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { userSidebarItems } from '@/lib/userSidebarItems';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const transferSchema = z.object({
    amount: z.number().min(10000, "Minimum amount is 10,000").refine(val => val % 10000 === 0, "Amount must be in multiples of 10,000"),
    method: z.enum(["Cash", "Bank Transfer", "USDT Deposit", "Wallet"]),
    reference_id: z.string().optional(),
    notes: z.string().optional(),
    receipt_image: z.any().optional(),
}).superRefine((data, ctx) => {
    if (data.method === "Bank Transfer" || data.method === "USDT Deposit") {
        if (!data.receipt_image || data.receipt_image.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Payment slip is required for ${data.method}`,
                path: ["receipt_image"]
            });
        }
    }
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransfersPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const router = useRouter();
    const [createTransfer, { isLoading: isCreatingTransfer }] = useCreateTransferMutation();
    const [investFromWallet, { isLoading: isInvestingWallet }] = useInvestFromWalletMutation();
    const { data: transfersData, isLoading: isLoadingTransfers, refetch, isFetching } = useGetMyTransfersQuery();
    const { data: walletData } = useGetWalletQuery();
    const { data: dashboardData } = useGetUserDashboardQuery();
    const [triggerPaymentDetails, { data: paymentData, isLoading: isLoadingPaymentDetails }] = useLazyGetPaymentDetailsQuery();

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            amount: 10000
        }
    });

    const selectedMethod = watch("method");
    const amount = watch("amount");

    // Handle response which gives a list of banks
    const rawPaymentData = paymentData?.data;
    // @ts-ignore - Runtime check for array vs object to be safe
    const paymentBanksList = Array.isArray(rawPaymentData) ? rawPaymentData : (rawPaymentData ? [rawPaymentData] : []);
    // Find primary bank or default to the first one
    const paymentDetails = paymentBanksList.find((bank: any) => bank.is_primary === 1 || bank.is_primary === true) || paymentBanksList[0];

    const walletBalance = walletData?.data?.wallet_balance ? Number(walletData.data.wallet_balance) : 0;
    const isWalletActive = dashboardData?.data?.account?.is_wallet_active;

    const isCreating = isCreatingTransfer || isInvestingWallet;

    React.useEffect(() => {
        if (selectedMethod === "Bank Transfer" || selectedMethod === "USDT Deposit") {
            triggerPaymentDetails();
        }
    }, [selectedMethod, triggerPaymentDetails]);

    const onSubmit = async (data: TransferFormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        if (data.method === "Wallet") {
            if (!isWalletActive) {
                setErrorMessage("Wallet access is not active.");
                return;
            }
            if (data.amount > walletBalance) {
                setErrorMessage("Insufficient wallet balance.");
                return;
            }
            try {
                await investFromWallet({
                    user_id: user?.id || 0, // Should be passed if needed or handled by backend from token
                    amount: data.amount,
                    total_months: 12 // Default or configurable? Assuming standard plan
                }).unwrap();
                setSuccessMessage("Investment from successfully created!");
                reset();
                refetch();
            } catch (error: any) {
                console.error("Wallet investment failed", error);
                setErrorMessage(error?.data?.message || "Failed to process wallet investment.");
            }
            return;
        }

        try {
            const formData = new FormData();
            formData.append('amount', data.amount.toString());
            formData.append('method', data.method);
            if (data.reference_id) formData.append('reference_id', data.reference_id);
            if (data.notes) formData.append('notes', data.notes);

            // Handle file upload
            if (data.receipt_image && data.receipt_image.length > 0) {
                formData.append('receipt_image', data.receipt_image[0]);
            }

            await createTransfer(formData).unwrap();
            setSuccessMessage("Investment request submitted successfully. Waiting for approval.");
            reset();
        } catch (error: any) {
            console.error("Investment failed", error);
            setErrorMessage(error?.data?.message || "Failed to submit investment request.");
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`, { icon: '📋' });
    };

    const transfers = transfersData?.data?.transfers || [];


    return (
        <ProtectedRoute>
            <DashboardLayout
                sidebarItems={userSidebarItems}
                user={user ? { ...user, role: 'user' } : undefined}
                onLogout={logout}
                isLoggingOut={isLoggingOut}
            >
                <div className="space-y-8 pb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">Investment Request</h1>
                        <p className="text-muted-foreground mt-1">Submit a new investment request or view your history.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Transfer Form */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Wallet Balance Card for Wallet Method */}
                            {selectedMethod === "Wallet" && (
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
                                            <Wallet size={16} /> Wallet Balance
                                        </h3>
                                        <p className={`text-3xl font-bold font-mono ${walletBalance >= (amount || 0) ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                                            ₹{walletBalance.toLocaleString('en-IN')}
                                        </p>
                                        {amount > 0 && amount > walletBalance && (
                                            <p className="text-xs text-red-500 mt-2 font-medium bg-red-500/10 p-2 rounded-lg inline-block">
                                                Insufficient balance for this investment.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details Card - Dynamic & Attractive */}
                            {(selectedMethod === "Bank Transfer" || selectedMethod === "USDT Deposit") && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="bg-linear-to-br from-background to-muted border border-primary/20 rounded-2xl p-0.5 shadow-lg overflow-hidden group hover:shadow-primary/5 transition-all">
                                        <div className="bg-card rounded-[15px] p-5 h-full relative overflow-hidden">
                                            {/* Decorative background elements */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2 relative z-10">
                                                {isLoadingPaymentDetails ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Building2 size={16} />
                                                )}
                                                {selectedMethod === "Bank Transfer" ? "Bank Details" : "Wallet Details"}
                                            </h3>

                                            {isLoadingPaymentDetails ? (
                                                <div className="space-y-3 animate-pulse">
                                                    <div className="h-10 bg-muted rounded-lg w-full"></div>
                                                    <div className="h-10 bg-muted rounded-lg w-full"></div>
                                                    <div className="h-10 bg-muted rounded-lg w-full"></div>
                                                </div>
                                            ) : paymentDetails ? (
                                                selectedMethod === "Bank Transfer" ? (
                                                    <div className="space-y-4 text-sm relative z-10">
                                                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Bank Name</p>
                                                            <p className="font-bold text-foreground">{paymentDetails.bank_name}</p>
                                                        </div>
                                                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Account Holder</p>
                                                            <p className="font-bold text-foreground">{paymentDetails.account_holder_name}</p>
                                                        </div>
                                                        <div
                                                            className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex justify-between items-center group/copy cursor-pointer hover:bg-primary/10 transition-colors"
                                                            onClick={() => copyToClipboard(paymentDetails.account_number || "", "Account Number")}
                                                        >
                                                            <div>
                                                                <p className="text-[10px] text-primary/70 uppercase tracking-widest mb-1">Account Number</p>
                                                                <p className="font-mono font-bold tracking-wide text-primary text-lg">{paymentDetails.account_number}</p>
                                                            </div>
                                                            <Copy size={16} className="text-primary opacity-50 group-hover/copy:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div
                                                            className="bg-muted/30 p-3 rounded-lg border border-border/50 flex justify-between items-center group/copy cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => copyToClipboard(paymentDetails.ifsc_code || "", "IFSC Code")}
                                                        >
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">IFSC Code</p>
                                                                <p className="font-mono font-bold tracking-wide">{paymentDetails.ifsc_code}</p>
                                                            </div>
                                                            <Copy size={14} className="opacity-50 group-hover/copy:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 text-sm relative z-10">
                                                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Network</p>
                                                            <p className="font-bold text-foreground">{paymentDetails.usdt_network}</p>
                                                        </div>
                                                        <div
                                                            className="bg-primary/5 p-4 rounded-lg border border-primary/10 group/copy cursor-pointer hover:bg-primary/10 transition-colors"
                                                            onClick={() => copyToClipboard(paymentDetails.usdt_address || "", "Wallet Address")}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-[10px] text-primary/70 uppercase tracking-widest">USDT Address</p>
                                                                <Copy size={14} className="text-primary opacity-50 group-hover/copy:opacity-100 transition-opacity" />
                                                            </div>
                                                            <p className="font-mono text-xs break-all leading-relaxed text-primary font-medium">{paymentDetails.usdt_address}</p>
                                                        </div>
                                                        {(paymentDetails.qr_code || paymentDetails.receipt_image) && (
                                                            <div className="mt-4 flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-border/50">
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Scan QR Code</p>
                                                                <div className="w-48 h-48 bg-white rounded-lg p-1">
                                                                    {(() => {
                                                                        const qrSrc = paymentDetails.qr_code || paymentDetails.receipt_image || "";
                                                                        const fullSrc = qrSrc.startsWith('http') ? qrSrc : `${process.env.NEXT_PUBLIC_BACKEND_URL}${qrSrc.startsWith('/') ? '' : '/storage/'}${qrSrc}`;
                                                                        return (
                                                                            <div
                                                                                className="relative group cursor-zoom-in w-full h-full"
                                                                                onClick={() => setPreviewImage({ url: fullSrc, title: 'USDT Payment QR' })}
                                                                            >
                                                                                <img
                                                                                    src={fullSrc}
                                                                                    alt="USDT QR Code"
                                                                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                                                />
                                                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                                                    <Maximize2 className="text-primary w-6 h-6" />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg text-xs leading-relaxed flex gap-2">
                                                            <AlertCircle size={16} className="shrink-0" />
                                                            <span>Only send USDT ({paymentDetails.usdt_network}). Sending other assets may result in permanent loss.</span>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="text-sm text-red-500">Failed to load details. Please try again.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-primary" />
                                    New Investment
                                </h2>

                                {successMessage && (
                                    <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                            <input
                                                type="number"
                                                {...register("amount", { valueAsNumber: true })}
                                                className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                                placeholder="50000"
                                            />
                                        </div>
                                        {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                                        <p className="text-xs text-muted-foreground">Min: 10,000. Multiples of 10,000.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Payment Method</label>
                                        <div className="relative">
                                            <select
                                                {...register("method")}
                                                defaultValue=""
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select Payment Method</option>
                                                {isWalletActive && (
                                                    <option value="Wallet">Wallet (₹{walletBalance.toLocaleString('en-IN')})</option>
                                                )}
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Cash">Cash</option>
                                                <option value="USDT Deposit">USDT Deposit</option>
                                            </select>
                                            <ArrowLeftRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none rotate-90" />
                                        </div>
                                        {errors.method && <p className="text-red-500 text-xs">{errors.method.message}</p>}
                                    </div>

                                    {selectedMethod !== "Wallet" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Transaction / Reference ID</label>
                                            <input
                                                type="text"
                                                {...register("reference_id")}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="e.g. UPI Ref, Bank Txn ID"
                                            />
                                            {errors.reference_id && <p className="text-red-500 text-xs">{errors.reference_id.message}</p>}
                                        </div>
                                    )}

                                    {selectedMethod !== "Wallet" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Notes (Optional)</label>
                                            <textarea
                                                {...register("notes")}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                                                placeholder="Any additional details..."
                                            />
                                        </div>
                                    )}

                                    {(selectedMethod !== "Wallet" && selectedMethod !== "Cash") && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                Payment Proof / Slip {(selectedMethod === 'Bank Transfer' || selectedMethod === 'USDT Deposit') ? <span className="text-red-500">*</span> : '(Optional)'}
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                {...register("receipt_image")}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                            />
                                            {errors.receipt_image && <p className="text-red-500 text-xs">{errors.receipt_image.message as string}</p>}
                                            <p className="text-xs text-muted-foreground">Upload receipt image or PDF.</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        {selectedMethod === 'Wallet' ? 'Invest from Wallet' : 'Submit Investment'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="lg:col-span-2">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[500px]">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        Investment History
                                    </h2>
                                    <RefreshButton
                                        onRefresh={refetch}
                                        isRefreshing={isLoadingTransfers || isFetching}
                                        label="Refresh"
                                    />
                                </div>

                                {isLoadingTransfers ? (
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
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${transfer.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                                        transfer.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                            'bg-yellow-500/10 text-yellow-600'
                                                        }`}>
                                                        <TrendingUp size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-foreground">₹{Number(transfer.amount).toLocaleString('en-IN')}</h4>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-uppercase font-bold tracking-wider ${transfer.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                                                transfer.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                                    'bg-yellow-500/10 text-yellow-600'
                                                                }`}>
                                                                {transfer.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground/80">{transfer.method}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                            <span>{new Date(transfer.created_at).toLocaleDateString()} at {new Date(transfer.created_at).toLocaleTimeString()}</span>
                                                            {transfer.reference_id && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-border"></span>
                                                                    <span className="font-mono">Ref: {transfer.reference_id}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                        {transfer.notes && (
                                                            <p className="text-xs text-muted-foreground mt-1 italic">"{transfer.notes}"</p>
                                                        )}
                                                        {transfer.receipt_image && (
                                                            <button
                                                                onClick={() => setPreviewImage({ url: transfer.receipt_image as string, title: `Receipt: ₹${Number(transfer.amount).toLocaleString('en-IN')}` })}
                                                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                                View Receipt
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Image Preview Modal */}
                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div
                            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-2">
                                <h3 className="text-white font-medium tracking-wide">{previewImage.title}</h3>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setPreviewImage(null)}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Close Preview</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="bg-white rounded-2xl p-2 shadow-2xl overflow-hidden group">
                                <img
                                    src={previewImage.url}
                                    alt="Preview"
                                    className="max-w-full max-h-[75vh] object-contain rounded-xl"
                                />
                            </div>

                            <div className="mt-6 flex gap-4">
                                <a
                                    href={previewImage.url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-primary text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Upload className="w-4 h-4 rotate-180" />
                                    Download Image
                                </a>
                                <button
                                    onClick={() => setPreviewImage(null)}
                                    className="bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
