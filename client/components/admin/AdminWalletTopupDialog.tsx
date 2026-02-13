"use client";

import React, { useState } from 'react';
import { Wallet, Plus, X } from 'lucide-react';
import { useAdminTopupUserWalletMutation } from '@/redux/apies/walletApi';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface AdminWalletTopupDialogProps {
    userId: number;
    userName: string;
    currentBalance?: string | number;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export default function AdminWalletTopupDialog({
    userId,
    userName,
    currentBalance,
    trigger,
    onSuccess
}: AdminWalletTopupDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [topupWallet, { isLoading }] = useAdminTopupUserWalletMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        try {
            console.log("topupWallet");
            const result = await topupWallet({
                user_id: userId,
                amount: amountNum,
                description: description.trim()
            }).unwrap();

            toast.success(result.message || 'Wallet topped up successfully!');
            setIsOpen(false);
            setAmount('');
            setDescription('');
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to topup wallet:', error);
            const errorMsg = error?.data?.message || 'Failed to topup wallet';
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

    return (
        <>
            {/* Trigger Button */}
            <div onClick={() => setIsOpen(true)}>
                {trigger || (
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Plus size={16} className="mr-1" />
                        Topup Wallet
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
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Topup Wallet</h2>
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
                                    Amount <span className="text-red-500">*</span>
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
                                        className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter reason for topup (e.g., Bonus, Refund, etc.)"
                                    rows={3}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} className="mr-2" />
                                            Topup Wallet
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Info Note */}
                        <div className="px-6 pb-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    💡 This will instantly credit the user's wallet. The transaction will be recorded in the wallet history.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
