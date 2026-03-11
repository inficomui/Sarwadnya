"use client";
import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import FormattedDate from '@/components/common/FormattedDate';

interface OverviewTabProps {
    dashboardData: any;
    transfersData: any;
}

const OverviewTab = ({ dashboardData, transfersData }: OverviewTabProps) => {
    const account = dashboardData?.data?.account;
    const financials = dashboardData?.data?.financials;
    const totalInvested = Number(transfersData?.data?.total_transferred || 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign size={20} className="text-primary" />
                        Account Summary
                    </h3>
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                                {account?.status || 'Active'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Joined</span>
                            <span className="font-medium">
                                {account?.joined_at ? <FormattedDate date={account.joined_at} /> : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Invested</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                ₹{totalInvested.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Withdrawn</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                                ₹0
                            </span>
                        </div>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Earnings Breakdown
                    </h3>
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total ROI</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                ₹{Number(financials?.earnings_breakdown?.roi_income || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Referral Commission</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                                ₹{Number(financials?.earnings_breakdown?.referral_income || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-border">
                            <span className="font-medium">Total Earnings</span>
                            <span className="font-bold text-lg text-primary">
                                ₹{(Number(financials?.earnings_breakdown?.roi_income || 0) + Number(financials?.earnings_breakdown?.referral_income || 0)).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OverviewTab);
