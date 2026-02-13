"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvestFromWalletMutation } from "@/redux/apies/walletApi";
import { Loader2, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvestForOthersDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export default function InvestForOthersDialog({ trigger }: InvestForOthersDialogProps) {
    const [amount, setAmount] = useState('');
    const [userId, setUserId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const [investFromWallet, { isLoading }] = useInvestFromWalletMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!userId) {
            toast.error("Please enter a valid User ID");
            return;
        }

        try {
            await investFromWallet({
                amount: Number(amount),
                user_id: Number(userId)
            }).unwrap();

            toast.success("Investment created successfully!");
            setIsOpen(false);
            setAmount('');
            setUserId('');
        } catch (error: any) {
            console.error("Investment error:", error);
            const msg = error?.data?.message || "Failed to create investment";
            toast.error(msg);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Invest for Others
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">User ID</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <User size={16} />
                            </span>
                            <Input
                                id="userId"
                                type="number"
                                placeholder="Enter User ID"
                                className="pl-9"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-8 text-lg font-bold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex items-start gap-2">
                        <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            This amount will be deducted from your wallet balance immediately.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Invest'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
