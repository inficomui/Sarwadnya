"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestTopupMutation } from "@/redux/apies/walletApi";
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TopupDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export default function TopupDialog({ trigger }: TopupDialogProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const [requestTopup, { isLoading }] = useRequestTopupMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            await requestTopup({
                amount: Number(amount),
                description,
                receipt: receipt || undefined
            }).unwrap();

            toast.success("Top-up request submitted successfully!");
            setIsOpen(false);
            setAmount('');
            setDescription('');
            setReceipt(null);
        } catch (error: any) {
            console.error("Top-up error:", error);
            const msg = error?.data?.message || "Failed to submit top-up request";
            toast.error(msg);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            // Check based on extension as well for robustness
            const validExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
            const extension = file.name.split('.').pop()?.toLowerCase();

            if (!validTypes.includes(file.type) && !validExtensions.includes(extension || '')) {
                toast.error("Invalid file type. Please upload JPG, PNG, or PDF.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit example
                toast.error("File is too large. Max size 5MB.");
                return;
            }
            setReceipt(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Request Wallet Top-up
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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

                    <div className="space-y-2">
                        <Label htmlFor="description">Reference / Notes (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="e.g., Bank Transfer Ref: 123456"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Receipt (Optional)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:bg-muted/30 transition-colors text-center cursor-pointer relative">
                            <Input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                {receipt ? (
                                    <>
                                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                            {receipt.name}
                                        </p>
                                        <p className="text-xs text-green-600">Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <p className="text-sm">Click to upload receipt</p>
                                        <p className="text-xs text-muted-foreground/70">JPG, PNG, PDF</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex items-start gap-2">
                        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Your request will be reviewed by an admin. Balance will be updated upon approval.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
