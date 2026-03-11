"use client";
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetTreeSummaryQuery, useGetTreeUsersQuery, useGetTreeInvestmentSummaryQuery } from '@/redux/apies/treeApi';
import {
    Users,
    Network,
    Briefcase,
    Loader2,
    RefreshCw,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { userSidebarItems } from '@/lib/userSidebarItems';
import { cn } from '@/lib/utils';
import ReferralActionDialog from '@/components/dashboard/ReferralActionDialog';
import { LevelSelector } from '@/components/dashboard/referrals/LevelSelector';
import { NetworkStats } from '@/components/dashboard/referrals/NetworkStats';
import { GenerationUserList } from '@/components/dashboard/referrals/GenerationUserList';

export default function ReferralsPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [page, setPage] = useState(1);

    const { data: treeSummary, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetTreeSummaryQuery();
    const { data: investmentSummary, isLoading: isInvestmentLoading, refetch: refetchInvestmentSummary } = useGetTreeInvestmentSummaryQuery();
    const { data: levelUsers, isLoading: isUsersLoading, refetch: refetchUsers } = useGetTreeUsersQuery({
        level: selectedLevel,
        page: page,
        per_page: 10
    });

    const handleRefresh = () => {
        refetchSummary();
        refetchInvestmentSummary();
        refetchUsers();
    };

    const totalReferrals = treeSummary?.data?.total_referrals || 0;
    const levels = treeSummary?.data?.levels || {};

    const totalTeamInvestment = investmentSummary?.data?.total_team_investment || 0;
    const investmentLevels = investmentSummary?.data?.levels || {};

    // Calculate max level dynamically from the levels object
    const maxLevel = Math.max(
        ...Object.keys(levels)
            .filter(key => key.startsWith('level_'))
            .map(key => parseInt(key.replace('level_', ''))),
        9 // Default to at least 9 levels
    );

    const handleLevelChange = (level: number) => {
        setSelectedLevel(level);
        setPage(1); // Reset to first page on level change
    };

    const [selectedReferral, setSelectedReferral] = useState<{ id: number, name: string, email?: string } | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

    const handleOpenActionDialog = (user: any) => {
        setSelectedReferral({
            id: user.id,
            name: user.name,
            email: user.email
        });
        setIsActionDialogOpen(true);
    };

    const handleActionSuccess = () => {
        refetchSummary();
        refetchInvestmentSummary();
        refetchUsers(); // Refresh the list to reflect any status changes if applicable
    };

    return (
        <>
            <div className="space-y-6 md:space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-linear-to-r from-primary/10 via-transparent to-primary/10 p-6 -mx-6 md:mx-0 md:rounded-3xl">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-primary font-semibold tracking-wide uppercase text-xs"
                        >
                            <Network className="w-4 h-4" />
                            <span>Network Overview</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
                        >
                            Generation View
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground max-w-lg"
                        >
                            Explore your referral tree across all generations. Track the performance and growth of your network at each level.
                        </motion.p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Card className="flex-1 md:min-w-[200px] border-primary/20 bg-card/50 backdrop-blur-xs shadow-lg">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Team Invest</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold text-foreground leading-none">
                                            {isInvestmentLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `₹${totalTeamInvestment.toLocaleString()}`}
                                        </h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 md:min-w-[200px] border-primary/20 bg-card/50 backdrop-blur-xs shadow-lg">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Network</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold text-foreground leading-none">
                                            {isSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : totalReferrals}
                                        </h3>
                                        <span className="text-xs text-green-500 font-medium flex items-center gap-0.5">
                                            <TrendingUp size={10} /> Active
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isSummaryLoading || isUsersLoading || isInvestmentLoading}
                            className="h-12 w-12 rounded-md border-border shadow-sm cursor-pointer hover:bg-muted hover:text-foreground hover:border-primary/30 transition-all shrink-0 self-center"
                        >
                            <RefreshCw className={cn("w-5 h-5", (isSummaryLoading || isUsersLoading || isInvestmentLoading) && "animate-spin text-primary")} />
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* Level Selector & Stats - Responsive Design */}
                    {/* Level Selector & Stats - Responsive Design */}
                    <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 lg:z-10">
                        <LevelSelector
                            levels={levels}
                            investmentLevels={investmentLevels}
                            maxLevel={maxLevel}
                            selectedLevel={selectedLevel}
                            onLevelChange={handleLevelChange}
                            isInvestmentLoading={isInvestmentLoading}
                        />

                        <NetworkStats
                            totalReferrals={totalReferrals}
                            totalTeamInvestment={totalTeamInvestment}
                            levels={levels}
                            investmentLevels={investmentLevels}
                            maxLevel={maxLevel}
                        />

                        {/* Tip Card (Desktop only usually, but good for context) */}
                        <div className="hidden lg:block bg-linear-to-br from-blue-500/5 to-purple-500/5 rounded-2xl p-5 border border-blue-500/10 text-sm text-muted-foreground">
                            <p className="leading-relaxed">
                                <span className="font-semibold text-blue-500">Pro Tip:</span> Focus on supporting your Level 1 members (Directs) as their growth directly expands your lower levels.
                            </p>
                        </div>
                    </div>

                    {/* Users List - Main Area */}
                    <div className="lg:col-span-9">
                        <GenerationUserList
                            users={levelUsers?.data?.users}
                            selectedLevel={selectedLevel}
                            isLoading={isUsersLoading}
                            page={page}
                            setPage={setPage}
                            onOpenActionDialog={handleOpenActionDialog}
                        />
                    </div>
                </div>
            </div>

            <ReferralActionDialog
                isOpen={isActionDialogOpen}
                onClose={() => setIsActionDialogOpen(false)}
                referral={selectedReferral}
                onSuccess={handleActionSuccess}
            />
        </>
    );
}
