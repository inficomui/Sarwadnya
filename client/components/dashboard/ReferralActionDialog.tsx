import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetWalletQuery, useActivateReferralMutation, useRefundReferralMutation } from '@/redux/apies/walletApi';
import { useGetMyInvestmentsQuery } from '@/redux/apies/investmentApi';
import { Loader2, AlertCircle, Wallet, Zap, Minus, Plus, CheckCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ReferralActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    referral: {
        id: number;
        name: string;
        email?: string;
    } | null;
    onSuccess?: () => void;
}

export default function ReferralActionDialog({ isOpen, onClose, referral, onSuccess }: ReferralActionDialogProps) {
    const { data: walletData, isLoading: isWalletLoading, refetch } = useGetWalletQuery();
    const [activeTab, setActiveTab] = useState<"activate" | "refund">("activate");

    // Form States
    const [amount, setAmount] = useState('');
    const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | null>(null);

    const [activateReferral, { isLoading: isActivating }] = useActivateReferralMutation();
    const [refundReferral, { isLoading: isRefunding }] = useRefundReferralMutation();

    // Fetch ALL my investments
    // We filter client-side to find the ones relevant to this referral if possible, or just show active ones.
    // Given backend limitations (no specific endpoint), we show active investments funded by the current user.
    const { data: investmentsData, isLoading: isInvestmentsLoading } = useGetMyInvestmentsQuery(undefined, {
        skip: !isOpen || activeTab !== 'refund' || !referral,
    });

    const isLoading = isActivating || isRefunding;

    // Reset state when dialog opens/closes or referral changes
    React.useEffect(() => {
        if (isOpen) {
            refetch();
            setAmount('');
            setSelectedInvestmentId(null);
            if (activeTab === 'refund') setActiveTab("activate");
        }
    }, [isOpen, referral]);

    const walletBalance = parseFloat((walletData?.data?.wallet_balance || '0').toString().replace(/[^0-9.-]/g, ''));

    // Extract investments list from response (handling pagination structure or array)
    const investmentsList = Array.isArray(investmentsData?.data)
        ? investmentsData!.data
        : (investmentsData?.data?.data || []);

    // Filter for active investments
    const refundableInvestments = investmentsList.filter((inv: any) =>
        inv.status === 'active'
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!referral) return;

        try {
            if (activeTab === 'activate') {
                const amountNum = parseFloat(amount);
                if (isNaN(amountNum) || amountNum <= 0) {
                    toast.error('Please enter a valid amount');
                    return;
                }

                if (amountNum > walletBalance) {
                    toast.error('Insufficient wallet balance');
                    return;
                }

                const result = await activateReferral({
                    referral_id: referral.id,
                    amount: amountNum,
                    total_months: 12
                }).unwrap();
                toast.success(result.message || 'Activation successful');
            } else {
                if (!selectedInvestmentId) {
                    toast.error('Please select an active investment to refund');
                    return;
                }

                const result = await refundReferral({
                    investment_id: selectedInvestmentId
                }).unwrap();
                toast.success(result.message || 'Refund processed successfully');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            const errorMsg = error?.data?.message || `Failed to process ${activeTab}`;
            if (errorMsg.includes("API Endpoint missing")) {
                toast.error("Refund feature requires backend update.");
            } else {
                toast.error(errorMsg);
            }
        }
    };

    if (!referral) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl overflow-hidden">
                <DialogHeader className="pb-4 border-b border-border/50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl shadow-sm", activeTab === 'activate' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-600')}>
                            {activeTab === 'activate' ? <Zap size={22} strokeWidth={2.5} /> : <Wallet size={22} strokeWidth={2.5} />}
                        </div>
                        <div className="space-y-0.5">
                            <span className="block">{activeTab === 'activate' ? 'Activate Member' : 'Process Refund'}</span>
                            <span className="block text-sm font-normal text-muted-foreground">
                                Account for <span className="font-semibold text-foreground underline decoration-dotted">{referral.name}</span>
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="pt-6">
                    {activeTab === 'activate' && (
                        <div className="bg-linear-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden group mb-6 hover:shadow-primary/25 transition-all">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000"></div>
                            <div className="relative z-10 flex flex-col gap-2">
                                <span className="text-primary-foreground/90 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                    <Wallet size={14} className="opacity-80" /> Available Balance
                                </span>
                                <span className="text-4xl font-bold tracking-tighter tabular-nums text-white drop-shadow-xs">
                                    {isWalletLoading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                                    ) : (
                                        `₹${walletBalance.toLocaleString('en-IN')}`
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
                        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger value="activate" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-sm font-medium">
                                <Plus size={16} className="mr-2" />
                                Invest / Activate
                            </TabsTrigger>
                            <TabsTrigger value="refund" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-sm font-medium">
                                <Minus size={16} className="mr-2" />
                                Get Refund
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            {/* Info Banner */}
                            <div className={cn("rounded-xl p-4 flex gap-3 items-start border",
                                activeTab === 'activate'
                                    ? "bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-100"
                                    : "bg-red-500/5 border-red-500/20 text-red-900 dark:text-red-100"
                            )}>
                                <AlertCircle size={18} className={cn("shrink-0 mt-0.5", activeTab === 'activate' ? "text-amber-500" : "text-red-500")} />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">{activeTab === 'activate' ? 'Investment Terms' : 'Refund Policy'}</h4>
                                    <p className="text-xs leading-relaxed opacity-90">
                                        {activeTab === 'activate'
                                            ? `Funds will be deducted from your wallet to invest for ${referral.name}. ROI will be credited to them.`
                                            : `Select an active investment below to cancel. Funds will be refunded to your wallet instantly.`}
                                    </p>
                                </div>
                            </div>

                            {activeTab === 'activate' ? (
                                <div className="space-y-3">
                                    <Label htmlFor="amount" className="text-sm font-medium ml-1">Investment Amount (₹)</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <span className="text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">₹</span>
                                        </div>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="Enter amount (e.g., 5000)"
                                            className="pl-8 h-12 text-lg bg-background border-input hover:border-primary/50 focus:border-primary transition-colors shadow-xs"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="1"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium ml-1">Select Active Investment</Label>
                                    <div className="border rounded-xl bg-card overflow-hidden min-h-[150px] relative">
                                        {isInvestmentsLoading ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-xs z-10">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <span className="text-xs font-medium text-muted-foreground">Loading investments...</span>
                                            </div>
                                        ) : refundableInvestments.length > 0 ? (
                                            <div className="max-h-[200px] overflow-y-auto p-2 space-y-2">
                                                {refundableInvestments.map((inv: any) => (
                                                    <div
                                                        key={inv.id}
                                                        onClick={() => setSelectedInvestmentId(inv.id)}
                                                        className={cn(
                                                            "flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50",
                                                            selectedInvestmentId === inv.id
                                                                ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                                                : "border-transparent bg-muted/30"
                                                        )}
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-foreground text-sm">₹{Number(inv.amount).toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <span>ID: #{inv.id}</span>
                                                                <span>•</span>
                                                                <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        {selectedInvestmentId === inv.id ? (
                                                            <CheckCircle className="w-5 h-5 text-primary fill-primary/10" />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[150px] gap-2 text-center p-4">
                                                <Search className="w-8 h-8 text-muted-foreground/30" />
                                                <p className="text-sm font-medium text-muted-foreground">No active investments found</p>
                                                <p className="text-xs text-muted-foreground/70">Only active investments paid by you can be refunded.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className={cn("w-full h-12 text-base shadow-lg transition-all font-semibold active:scale-[0.98]",
                                    activeTab === 'activate'
                                        ? "bg-primary hover:bg-primary/90 shadow-primary/25"
                                        : "bg-red-600 hover:bg-red-700 shadow-red-600/25 text-white"
                                )}
                                disabled={isLoading || isWalletLoading || (activeTab === 'refund' && (!selectedInvestmentId || refundableInvestments.length === 0))}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {activeTab === 'activate' ? (
                                            <>Confirm Investment <Zap size={18} /></>
                                        ) : (
                                            <>Confirm Refund <Minus size={18} /></>
                                        )}
                                    </span>
                                )}
                            </Button>
                        </form>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
