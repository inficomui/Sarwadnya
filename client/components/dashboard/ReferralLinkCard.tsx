"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface ReferralLinkCardProps {
    referralCode?: string;
    isRestricted?: boolean;
}

const ReferralLinkCard = ({ referralCode, isRestricted = false }: ReferralLinkCardProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const referralLink = mounted && referralCode
        ? `${window.location.origin}/signup?ref=${referralCode}`
        : referralCode ? "..." : "Loading...";

    const handleCopyLink = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (isRestricted) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-600 dark:text-slate-400">Referral Link Locked</h3>
                        <p className="text-sm text-slate-400 font-medium">Available after account activation.</p>
                    </div>
                </div>
                <Button size="sm" variant="ghost" disabled className="bg-slate-100 dark:bg-slate-800">
                    Locked
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative group mb-6"
        >
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/20 shadow-sm shrink-0">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Your Referral Link</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Share this link to grow your network</p>
                    </div>
                </div>

                <div className="flex-1 w-full flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Input
                        readOnly
                        value={referralLink}
                        className="border-none shadow-none bg-transparent font-mono text-sm focus-visible:ring-0 text-slate-600 dark:text-slate-300 font-medium overflow-hidden text-ellipsis"
                    />
                    <Button
                        size="default"
                        onClick={handleCopyLink}
                        className={`min-w-[140px] rounded-xl font-bold shadow-lg transition-all active:scale-95 py-6 ${isCopied
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
                            }`}
                    >
                        {isCopied ? <Check size={18} className="mr-2" strokeWidth={3} /> : <Copy size={18} className="mr-2" strokeWidth={3} />}
                        {isCopied ? "Copied!" : "Copy Link"}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(ReferralLinkCard);
