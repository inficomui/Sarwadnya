"use client";

import React from 'react';
import { Wallet } from 'lucide-react';

interface WalletBalanceCardProps {
    balance: number | string;
    isLoading?: boolean;
}

export default function WalletBalanceCard({ balance, isLoading }: WalletBalanceCardProps) {
    const formattedBalance = Number(balance).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <div className="bg-linear-to-br from-primary via-primary/90 to-amber-600 rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden group">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-12 -mb-24 transition-transform duration-700 group-hover:scale-110"></div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                        <Wallet size={24} className="text-white" />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Wallet Balance</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        {isLoading ? (
                            <span className="animate-pulse opacity-50">Loading...</span>
                        ) : (
                            <>
                                <span className="text-2xl mr-1 opacity-80">₹</span>
                                {formattedBalance}
                            </>
                        )}
                    </h2>
                    <p className="text-xs text-white/60 mt-2">
                        Contact admin for wallet top-up
                    </p>
                </div>
            </div>
        </div>
    );
}
