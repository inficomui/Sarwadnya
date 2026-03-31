"use client";
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetTreeSummaryQuery, useGetTreeUsersQuery, useGetTreeInvestmentSummaryQuery, useGetReferralLevelStatusQuery } from '@/redux/apies/treeApi';
import {
    Users,
    Network,
    Briefcase,
    Loader2,
    RefreshCw,
    TrendingUp,
    ShieldCheck,
    Trophy
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
    const { data: levelStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useGetReferralLevelStatusQuery();
    const { data: investmentSummary, isLoading: isInvestmentLoading, refetch: refetchInvestmentSummary } = useGetTreeInvestmentSummaryQuery();
    const { data: levelUsers, isLoading: isUsersLoading, refetch: refetchUsers } = useGetTreeUsersQuery({
        level: selectedLevel,
        page: page,
        per_page: 10
    });

    const handleRefresh = () => {
        refetchSummary();
        refetchStatus();
        refetchInvestmentSummary();
        refetchUsers();
    };

    const totalReferrals = treeSummary?.data?.summary?.total_team ?? 0;
    const activeReferrals = treeSummary?.data?.summary?.total_active ?? 0;
    const inactiveReferrals = treeSummary?.data?.summary?.total_inactive ?? 0;
    const unlockedLevelsCount = treeSummary?.data?.summary?.unlocked_levels ?? 1;
    const totalTeamInvestmentDisplay = treeSummary?.data?.summary?.total_team_investment ?? 0;
    const totalDirectInvestment = treeSummary?.data?.summary?.total_direct_investment ?? 0;

    // Logic for next level progress
    const nextLevelTarget = unlockedLevelsCount * 100000;
    const progressPercent = Math.min((totalDirectInvestment / nextLevelTarget) * 100, 100);

    const levels = treeSummary?.data?.levels || {};
    const statusLevels = levelStatus?.data?.levels || {};

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
        refetchStatus();
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
                        <Card className="flex-1 md:min-w-[240px] border-primary/20 bg-card/50 backdrop-blur-xs shadow-lg overflow-hidden group">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
                                        <Trophy size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Business (LVL 1)</p>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-black text-foreground tabular-nums leading-none">
                                                {isSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `₹${totalDirectInvestment.toLocaleString()}`}
                                            </h3>
                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">Unlocks LVL {unlockedLevelsCount + 1}</span>
                                        </div>
                                    </div>
                                </div>

                                        {unlockedLevelsCount < 9 && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-muted-foreground font-medium">Progress to LVL {unlockedLevelsCount + 1}</span>
                                                    <span className="text-foreground font-bold">{progressPercent.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPercent}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-linear-to-r from-primary to-primary/60"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] text-muted-foreground italic">
                                                    <span>Target: ₹{nextLevelTarget.toLocaleString()}</span>
                                                    <span>Need: ₹{Math.max(0, nextLevelTarget - totalDirectInvestment).toLocaleString()} more</span>
                                                </div>
                                            </div>
                                        )}
                            </CardContent>
                        </Card>

                        <Card className="flex-1 md:min-w-[180px] border-border bg-card/50 backdrop-blur-xs shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">Total Team Business</p>
                                    <h3 className="text-lg font-bold text-foreground tabular-nums leading-tight">
                                        {isSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `₹${totalTeamInvestmentDisplay.toLocaleString()}`}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 md:min-w-[150px] border-border bg-card/50 backdrop-blur-xs shadow-sm group/access relative">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">Access</p>
                                    <h3 className="text-lg font-bold text-foreground leading-tight">
                                        {isSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `${unlockedLevelsCount} Levels`}
                                    </h3>
                                </div>

                                {/* Requirement Hover Info */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover/access:opacity-100 transition-opacity">
                                    <div className="relative group/info">
                                        <div className="p-1 cursor-help text-muted-foreground hover:text-primary">
                                            <TrendingUp size={12} />
                                        </div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-3 z-50 pointer-events-none group-hover/info:block hidden animate-in fade-in zoom-in duration-200">
                                            <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-wider border-b border-border pb-1">Unlocking Rules</p>
                                            <div className="space-y-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                                                    <div key={lvl} className="flex justify-between text-[10px]">
                                                        <span className={lvl <= unlockedLevelsCount ? "text-green-600 font-bold" : "text-muted-foreground"}>Level {lvl}</span>
                                                        <span className="text-foreground font-mono">₹{(lvl - 1) * 100000 === 0 ? "Always" : (lvl - 1) * 100000 + "L"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[8px] text-muted-foreground mt-2 border-t border-border pt-1 font-medium">✨ Based on Level 1 Business only</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isSummaryLoading || isUsersLoading || isInvestmentLoading || isStatusLoading}
                            className="h-12 w-12 rounded-md border-border shadow-sm cursor-pointer hover:bg-muted hover:text-foreground hover:border-primary/30 transition-all shrink-0 self-center"
                        >
                            <RefreshCw className={cn("w-5 h-5", (isSummaryLoading || isUsersLoading || isInvestmentLoading || isStatusLoading) && "animate-spin text-primary")} />
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* Level Selector & Stats - Responsive Design */}
                    <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 lg:z-10">
                        <LevelSelector
                            levels={levels}
                            investmentLevels={investmentLevels}
                            maxLevel={maxLevel}
                            selectedLevel={selectedLevel}
                            onLevelChange={handleLevelChange}
                            isInvestmentLoading={isInvestmentLoading}
                            levelStatus={statusLevels}
                        />

                        <NetworkStats
                            totalReferrals={totalReferrals}
                            totalTeamInvestment={totalTeamInvestmentDisplay}
                            levels={levels}
                            investmentLevels={investmentLevels}
                            maxLevel={maxLevel}
                        />

                        {/* Tip Card (Desktop only usually, but good for context) */}
                        <div className="hidden lg:block bg-linear-to-br from-blue-500/5 to-purple-500/5 rounded-2xl p-5 border border-blue-500/10 text-sm text-muted-foreground">
                            <p className="leading-relaxed">
                                <span className="font-semibold text-blue-500 text-base flex items-center gap-2 mb-1">
                                    <Trophy size={16} /> Strategy
                                </span>
                                Focus on supporting your Level 1 members (Directs) as their growth directly expands your lower levels and unlocks higher commissions.
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
