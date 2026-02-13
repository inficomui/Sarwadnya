"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Calendar, BadgeCheck } from 'lucide-react';
import FormattedDate from '@/components/common/FormattedDate';

interface DistributorProfileCardProps {
    user?: {
        name?: string;
    };
    profile?: {
        name?: string;
    };
    referral?: {
        code?: string;
    };
    account?: {
        status?: string;
        joined_at?: string;
    };
    isLoading?: boolean;
}

export const DistributorProfileCard: React.FC<DistributorProfileCardProps> = ({
    user,
    profile,
    referral,
    account,
    isLoading = false
}) => {
    // If loading, show skeleton could be implemented here, currently showing simpler structure
    if (isLoading) return <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 w-full"
        >
            <div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-700 dark:border-slate-800 relative w-full">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500 opacity-10 rounded-full -ml-10 -mb-10 blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row w-full">
                    {/* Header / Brand Strip */}
                    <div className="w-full md:w-16 bg-linear-to-r md:bg-linear-to-b from-orange-600 to-amber-600 flex md:flex-col items-center justify-center p-4 gap-2 shadow-lg z-10 shrink-0">
                        <BadgeCheck className="text-white w-6 h-6 md:w-8 md:h-8" />
                        <span className="md:hidden md:writing-mode-vertical text-xs font-bold tracking-widest uppercase opacity-80 whitespace-nowrap hidden">
                            Distributor Profile
                        </span>
                        <span className="md:hidden lg:hidden text-sm font-bold tracking-widest uppercase opacity-90">
                            Distributor Profile
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8 w-full">
                        <div className="flex flex-col gap-6">

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="w-full">
                                    <h3 className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-medium mb-1">Distributor Name</h3>
                                    <div className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white wrap-break-word">
                                        {profile?.name || user?.name || "Unknown User"}
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                                    <div className="text-xs text-slate-400 mb-1 text-center">Status</div>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold border uppercase whitespace-nowrap ${account?.status === 'active'
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                                        }`}>
                                        {account?.status || 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-2 border-t border-white/5">
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1.5 text-orange-400">
                                        <Hash size={16} className="shrink-0" />
                                        <span className="text-[10px] md:text-xs font-bold uppercase">Distributor ID</span>
                                    </div>
                                    <p className="font-mono text-base md:text-lg text-slate-200 tracking-wider truncate">
                                        {referral?.code || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5 text-orange-400">
                                        <Calendar size={16} className="shrink-0" />
                                        <span className="text-[10px] md:text-xs font-bold uppercase">Member Since</span>
                                    </div>
                                    <p className="font-mono text-base md:text-lg text-slate-200">
                                        <FormattedDate date={account?.joined_at} options={{ year: 'numeric', month: 'long', day: 'numeric' }} fallback="N/A" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
