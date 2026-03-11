"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface DashboardWarningsProps {
    isRestricted: boolean;
    earningLimitReached: boolean;
    earningLimitMessage?: string;
    kycStatus?: string;
}

const DashboardWarnings = ({
    isRestricted,
    earningLimitReached,
    earningLimitMessage,
    kycStatus
}: DashboardWarningsProps) => {
    const router = useRouter();

    return (
        <div className="space-y-4 mb-6">
            {/* Restricted User Warning */}
            {isRestricted && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400 shrink-0">
                        <Lock size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                            ROI Payouts Disabled
                        </h3>
                        <p className="text-orange-700 dark:text-orange-300 mt-1">
                            Your account is active and eligible for Referral Commissions. However, Daily ROI payouts are not available for this plan (₹10,000).
                        </p>
                    </div>
                </div>
            )}

            {/* Earning Limit Warning */}
            {earningLimitReached && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                            Earning Limit Reached
                        </h3>
                        <p className="text-red-700 dark:text-red-300 mt-1">
                            {earningLimitMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* KYC Status Warning */}
            {kycStatus === 'pending' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full text-yellow-600 dark:text-yellow-400 shrink-0">
                        <FileText size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                            KYC Verification Pending
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                            Your KYC documents are currently under review. Some features might be limited until verification is complete.
                        </p>
                    </div>
                </div>
            )}

            {kycStatus === 'rejected' && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                            KYC Verification Rejected
                        </h3>
                        <p className="text-red-700 dark:text-red-300 mt-1">
                            Your KYC documents were rejected. Please update your documents in the profile section.
                        </p>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="mt-2"
                            onClick={() => router.push('/dashboard/profile?tab=kyc')}
                        >
                            Update KYC
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(DashboardWarnings);
