"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTransferMutation, useGetMyTransfersQuery } from '@/redux/apies/transferApi';
import { useLazyGetPaymentDetailsQuery } from '@/redux/apies/paymentApi';
import { useInvestFromWalletMutation, useGetWalletQuery } from '@/redux/apies/walletApi';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';
import {
    Wallet,
    PieChart,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeftRight,
    Upload,
    X,
    Maximize2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Extracted Components
import PaymentDetailsCard from '@/components/dashboard/PaymentDetailsCard';
import InvestmentHistory from '@/components/dashboard/InvestmentHistory';

const transferSchema = z.object({
    amount: z.number().min(10000, "Minimum amount is 10,000").refine(val => val % 10000 === 0, "Amount must be in multiples of 10,000"),
    method: z.enum(["Cash", "Bank Transfer", "USDT Deposit", "Wallet"]),
    reference_id: z.string().optional(),
    notes: z.string().optional(),
    receipt_image: z.any().optional(),
}).superRefine((data, ctx) => {
    if ((data.method === "Bank Transfer" || data.method === "USDT Deposit") && (!data.receipt_image || data.receipt_image.length === 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Payment slip is required for ${data.method}`, path: ["receipt_image"] });
    }
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransfersPage() {
    const { user } = useAuth();
    const [createTransfer, { isLoading: isCreatingTransfer }] = useCreateTransferMutation();
    const [investFromWallet, { isLoading: isInvestingWallet }] = useInvestFromWalletMutation();
    const { data: transfersData, isLoading: isLoadingTransfers, refetch, isFetching } = useGetMyTransfersQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });
    const { data: walletData } = useGetWalletQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });
    const { data: dashboardData } = useGetUserDashboardQuery(undefined, {
        refetchOnMountOrArgChange: false,
    });
    const [triggerPaymentDetails, { data: paymentData, isLoading: isLoadingPaymentDetails }] = useLazyGetPaymentDetailsQuery();

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues: { amount: 10000 }
    });

    const selectedMethod = watch("method");
    const amount = watch("amount") || 0;

    const paymentBanksList = Array.isArray(paymentData?.data) ? paymentData.data : (paymentData?.data ? [paymentData.data] : []);
    const paymentDetails = paymentBanksList.find((bank: any) => bank.is_primary === 1) || paymentBanksList[0];
    const walletBalance = Number(walletData?.data?.wallet_balance || 0);
    const isWalletActive = dashboardData?.data?.account?.is_wallet_active;

    useEffect(() => {
        if (selectedMethod === "Bank Transfer" || selectedMethod === "USDT Deposit") triggerPaymentDetails();
    }, [selectedMethod, triggerPaymentDetails]);

    const onSubmit = async (data: TransferFormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        if (data.method === "Wallet") {
            if (!isWalletActive) return setErrorMessage("Wallet access is not active.");
            if (data.amount > walletBalance) return setErrorMessage("Insufficient wallet balance.");
            try {
                await investFromWallet({ user_id: user?.id || 0, amount: data.amount, total_months: 12 }).unwrap();
                setSuccessMessage("Investment successfully created!");
                reset();
                refetch();
            } catch (error: any) { setErrorMessage(error?.data?.message || "Failed to process wallet investment."); }
            return;
        }

        try {
            const formData = new FormData();
            formData.append('amount', data.amount.toString());
            formData.append('method', data.method);
            if (data.reference_id) formData.append('reference_id', data.reference_id);
            if (data.notes) formData.append('notes', data.notes);
            if (data.receipt_image?.[0]) formData.append('receipt_image', data.receipt_image[0]);

            await createTransfer(formData).unwrap();
            setSuccessMessage("Investment request submitted successfully.");
            reset();
            refetch();
        } catch (error: any) { setErrorMessage(error?.data?.message || "Failed to submit investment request."); }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">Investment Request</h1>
                <p className="text-muted-foreground mt-1">Submit a new investment request or view your history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    {selectedMethod === "Wallet" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2"><Wallet size={16} /> Wallet Balance</h3>
                            <p className={`text-3xl font-bold font-mono ${walletBalance >= amount ? 'text-green-600' : 'text-red-600'}`}>₹{walletBalance.toLocaleString('en-IN')}</p>
                            {amount > walletBalance && <p className="text-xs text-red-500 mt-2 bg-red-500/10 p-2 rounded-lg">Insufficient balance.</p>}
                        </div>
                    )}

                    <PaymentDetailsCard selectedMethod={selectedMethod} isLoading={isLoadingPaymentDetails} paymentDetails={paymentDetails} onPreviewImage={(url, title) => setPreviewImage({ url, title })} />

                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-primary" /> New Investment</h2>
                        {successMessage && <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-3 rounded-lg text-sm mb-4 flex items-start gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" /><span>{successMessage}</span></div>}
                        {errorMessage && <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-start gap-2"><AlertCircle className="w-5 h-5 shrink-0" /><span>{errorMessage}</span></div>}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <input type="number" {...register("amount", { valueAsNumber: true })} className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20 font-mono" placeholder="10000" />
                                </div>
                                {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                                <p className="text-xs text-muted-foreground text-right italic font-medium">Multiples of 10,000.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <div className="relative">
                                    <select {...register("method")} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20">
                                        <option value="" disabled>Select Method</option>
                                        {isWalletActive && <option value="Wallet">Wallet (₹{walletBalance.toLocaleString('en-IN')})</option>}
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="USDT Deposit">USDT Deposit</option>
                                    </select>
                                    <ArrowLeftRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none rotate-90" />
                                </div>
                            </div>

                            {selectedMethod !== "Wallet" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Reference ID / Transaction ID</label>
                                    <input type="text" {...register("reference_id")} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20" placeholder="e.g. Bank Ref No." />
                                </div>
                            )}

                            {(selectedMethod === "Bank Transfer" || selectedMethod === "USDT Deposit") && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2 italic text-muted-foreground"><Upload className="w-4 h-4" /> Payment Slip *</label>
                                    <input type="file" accept="image/*" {...register("receipt_image")} className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:font-semibold cursor-pointer" />
                                    {errors.receipt_image && <p className="text-red-500 text-xs">{errors.receipt_image.message as string}</p>}
                                </div>
                            )}

                            <button type="submit" disabled={isCreatingTransfer || isInvestingWallet} className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2">
                                {(isCreatingTransfer || isInvestingWallet) ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                {selectedMethod === 'Wallet' ? 'Invest from Wallet' : 'Submit Investment'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <InvestmentHistory transfers={transfersData?.data?.transfers || []} isLoading={isLoadingTransfers} isFetching={isFetching} refetch={refetch} onPreviewImage={(url, title) => setPreviewImage({ url, title })} />
                </div>
            </div>

            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-2">
                            <h3 className="text-white font-medium">{previewImage.title}</h3>
                            <button onClick={() => setPreviewImage(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><X size={20} /></button>
                        </div>
                        <div className="bg-white rounded-2xl p-2"><img src={previewImage.url} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-xl" /></div>
                    </div>
                </div>
            )}
        </div>
    );
}
