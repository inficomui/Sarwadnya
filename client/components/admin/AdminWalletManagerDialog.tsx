"use client";

import React, { useState } from 'react';
import { Wallet, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useAdminTopupUserWalletMutation, useAdminDeductUserWalletMutation } from '@/redux/apies/walletApi';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface AdminWalletManagerDialogProps {
    userId: number;
    userName: string;
    currentBalance?: string | number;
    isWalletActive?: boolean;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function AdminWalletManagerDialog({
    userId,
    userName,
    currentBalance,
    isWalletActive,
    trigger,
    onSuccess,
    open,
    onOpenChange
}: AdminWalletManagerDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalIsOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (isControlled && onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setInternalIsOpen(newOpen);
        }
    };

    const [activeTab, setActiveTab] = useState<"topup" | "refund">("topup");

    // Form States
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    // API Mutations
    const [topupWallet, { isLoading: isTopupLoading }] = useAdminTopupUserWalletMutation();
    const [deductWallet, { isLoading: isDeductLoading }] = useAdminDeductUserWalletMutation();

    const isLoading = isTopupLoading || isDeductLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (activeTab === 'refund') {
            if (currentBalance !== undefined && amountNum > Number(currentBalance)) {
                toast.error('Deduction amount cannot exceed current balance');
                return;
            }
            if (!isWalletActive) {
                toast.error("User's wallet is not active. Cannot process refund.");
                return;
            }
        }

        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        try {
            if (activeTab === 'topup') {
                const result = await topupWallet({
                    user_id: userId,
                    amount: amountNum,
                    description: description.trim()
                }).unwrap();
                toast.success(result.message || 'Wallet topped up successfully!');
            } else {
                const result = await deductWallet({
                    user_id: userId,
                    amount: amountNum,
                    description: description.trim()
                }).unwrap();
                toast.success(result.message || 'Refund/Deduction processed successfully!');
            }

            handleClose();
            onSuccess?.();
        } catch (error: any) {
            console.error(`Failed to ${activeTab} wallet:`, error);
            const errorMsg = error?.data?.message || `Failed to process ${activeTab}`;
            toast.error(errorMsg);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            handleOpenChange(false);
            setAmount('');
            setDescription('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger === undefined ? (
                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-green-400 hover:bg-green-500 text-white"
                    >
                        <Wallet size={16} className="mr-1" />
                    </Button>
                </DialogTrigger>
            ) : trigger !== null ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : null}

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Wallet</DialogTitle>
                    <DialogDescription>
                        {userName}
                    </DialogDescription>
                </DialogHeader>

                {/* Current Balance */}
                {currentBalance !== undefined && (
                    <div className="bg-muted/30 rounded-lg p-3 flex justify-between items-center border border-border/50">
                        <span className="text-sm text-muted-foreground font-medium">Current Balance</span>
                        <span className="text-lg font-bold text-primary font-mono">
                            ₹{Number(currentBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="topup" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                            <Plus size={14} className="mr-2" />
                            Topup
                        </TabsTrigger>
                        <TabsTrigger value="refund" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                            <Minus size={14} className="mr-2" />
                            Refund
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Amount <span className="text-destructive">*</span></Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="1"
                                        step="0.01"
                                        required
                                        disabled={isLoading}
                                        className={`pl-8 text-lg ${activeTab === 'refund' ? 'focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description <span className="text-destructive">*</span></Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={activeTab === 'topup' ? "e.g., Bonus, Manual Deposit" : "e.g., Correction, Refund"}
                                    required
                                    disabled={isLoading}
                                    className={`resize-none ${activeTab === 'refund' ? 'focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {activeTab === 'refund' && !isWalletActive && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertTriangle size={16} />
                                User wallet is inactive. Refund disabled.
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || (activeTab === 'refund' && !isWalletActive)}
                                className={`flex-1 text-white ${activeTab === 'topup'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {isLoading ? "Processing..." : activeTab === 'topup' ? "Add Funds" : "Deduct Funds"}
                            </Button>
                        </div>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
