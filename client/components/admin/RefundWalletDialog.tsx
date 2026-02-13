"use client";

import React, { useState } from 'react';
import { Wallet, Minus, X, AlertTriangle } from 'lucide-react';
import { useAdminDeductUserWalletMutation } from '@/redux/apies/walletApi';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface RefundWalletDialogProps {
    userId: number;
    userName: string;
    currentBalance?: string | number;
    isWalletActive?: boolean;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export default function RefundWalletDialog({
    userId,
    userName,
    currentBalance,
    isWalletActive,
    trigger,
    onSuccess
}: RefundWalletDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [deductWallet, { isLoading }] = useAdminDeductUserWalletMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (currentBalance !== undefined && amountNum > Number(currentBalance)) {
            toast.error('Deduction amount cannot exceed current balance');
            return;
        }

        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        try {
            const result = await deductWallet({
                user_id: userId,
                amount: amountNum,
                description: description.trim()
            }).unwrap();

            toast.success(result.message || 'Refund/Deduction processed successfully!');
            setIsOpen(false);
            setAmount('');
            setDescription('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to deduct wallet:', error);
            const errorMsg = error?.data?.message || 'Failed to process deduction';
            toast.error(errorMsg);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
            setAmount('');
            setDescription('');
        }
    };

    const handleOpen = () => {
        if (!isWalletActive) {
            toast.error("User's wallet is not active. Cannot process refund.");
            return;
        }
        setIsOpen(true);
    };

    return (
        <>
            {/* Trigger Button */}
            <div onClick={handleOpen}>
                {trigger || (
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={!isWalletActive}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Minus size={16} className="mr-1" />
                        Refund
                    </Button>
                )}
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Refund / Deduct Wallet</h2>
                                    <p className="text-sm text-muted-foreground">{userName}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Current Balance */}
                        {currentBalance !== undefined && (
                            <div className="px-6 pt-4">
                                <div className="bg-muted/30 rounded-lg p-3 flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Current Balance</span>
                                    <span className="text-lg font-bold text-primary">
                                        ₹{Number(currentBalance).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Amount to Refund <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        min="1"
                                        step="0.01"
                                        required
                                        disabled={isLoading}
                                        className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter reason (e.g., Refund for double payment)"
                                    rows={3}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    variant="destructive"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Minus size={16} className="mr-2" />
                                            Deduct Balance
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Info Note */}
                        <div className="px-6 pb-6">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                    This will instantly deduct from the user's wallet. Ensure the user has sufficient balance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
