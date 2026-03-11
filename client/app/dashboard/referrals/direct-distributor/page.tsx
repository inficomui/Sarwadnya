"use client";
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetTreeSummaryQuery, useGetTreeUsersQuery } from '@/redux/apies/treeApi';
import {
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    RefreshCw,
    UserCheck,
    TrendingUp,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FormattedDate from '@/components/common/FormattedDate';
import { userSidebarItems } from '@/lib/userSidebarItems';
import { cn } from '@/lib/utils';
import ReferralActionDialog from '@/components/dashboard/ReferralActionDialog';
import { Wallet } from 'lucide-react';

export default function DirectDistributorPage() {
    const { user, logout, isLoggingOut } = useAuth();
    // Fixed level 1 for Direct Distributor
    const selectedLevel = 1;
    const [page, setPage] = useState(1);

    const { data: treeSummary, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetTreeSummaryQuery();
    const { data: levelUsers, isLoading: isUsersLoading, refetch: refetchUsers } = useGetTreeUsersQuery({
        level: selectedLevel,
        page: page,
        per_page: 10
    });

    const handleRefresh = () => {
        refetchSummary();
        refetchUsers();
    };

    // Calculate total directs 
    const directCount = treeSummary?.data?.levels?.level_1 || 0;

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
        refetchUsers();
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
                            <Zap className="w-4 h-4" />
                            <span>First Line of Sponsorship</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
                        >
                            Direct Distributor
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground max-w-lg"
                        >
                            Manage your personally sponsored members. These are the foundation of your network growth and earnings.
                        </motion.p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Card className="flex-1 md:w-auto border-primary/20 bg-card/50 backdrop-blur-xs shadow-lg">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Direct Referrals</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold text-foreground leading-none">
                                            {isSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : directCount}
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
                            disabled={isSummaryLoading || isUsersLoading}
                            className="h-12  w-12 rounded-md border-border shadow-sm hover:bg-muted hover:text-foreground hover:border-primary/30 transition-all shrink-0"
                        >
                            <RefreshCw className={cn("w-5 h-5", (isSummaryLoading || isUsersLoading) && "animate-spin text-primary")} />
                        </Button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Users List - Main Area - Full Width */}
                    <div className="col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-card rounded-3xl border border-border shadow-md min-h-[600px] flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/5">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                    Your Direct Team
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">Level 1</span>
                                </h2>

                                {/* Search */}
                                <div className="relative w-full sm:w-64 group">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        className="w-full bg-background border border-border focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70 shadow-xs focus:shadow-md focus:shadow-primary/5"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 p-0 sm:p-2 bg-muted/5 relative">
                                {isUsersLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-card/50 backdrop-blur-xs z-10">
                                        <div className="p-4 rounded-full bg-primary/10">
                                            <Loader2 size={32} className="animate-spin text-primary" />
                                        </div>
                                        <p className="font-medium animate-pulse">Fetching direct referrals...</p>
                                    </div>
                                ) : levelUsers?.data?.users?.data?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 min-h-[400px]">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30 mb-6"
                                        >
                                            <UserCheck size={48} />
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">No direct referrals found</h3>
                                        <p className="text-sm max-w-sm text-center leading-relaxed">
                                            Share your referral link to start building your personal team directly.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left border-separate border-spacing-y-1 sm:border-spacing-y-2 px-2 sm:px-4">
                                                <thead className="text-xs text-muted-foreground uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium tracking-wider">User Details</th>
                                                        <th className="px-4 py-3 font-medium tracking-wider hidden md:table-cell">Contact Info</th>
                                                        <th className="px-4 py-3 font-medium tracking-wider">Investment</th>
                                                        <th className="px-4 py-3 font-medium tracking-wider">Commission</th>
                                                        <th className="px-4 py-3 font-medium tracking-wider text-right">Joined On</th>
                                                        <th className="px-4 py-3 font-medium tracking-wider text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="pb-4">
                                                    <AnimatePresence mode="wait">
                                                        {levelUsers?.data?.users?.data?.map((user: any, index: number) => (
                                                            <motion.tr
                                                                key={user.id}
                                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="group bg-card hover:bg-accent/50 transition-all duration-200 shadow-xs hover:shadow-md rounded-xl md:rounded-2xl border border-border/50"
                                                            >
                                                                <td className="px-4 py-3 sm:py-4 rounded-l-xl md:rounded-l-2xl">
                                                                    <div className="flex items-center gap-3 md:gap-4">
                                                                        <div className="relative">
                                                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-background group-hover:scale-110 transition-transform duration-300">
                                                                                {user.name.substring(0, 2).toUpperCase()}
                                                                            </div>
                                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">{user.name}</span>
                                                                            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-0.5">ID: {user.id}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 sm:py-4 hidden md:table-cell">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <div className="flex items-center gap-2 text-xs text-foreground/80">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                                                            {user.email}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></span>
                                                                            {user.phone_number}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 sm:py-4">
                                                                    <div className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                        {user.total_investment ? `₹${Number(user.total_investment).toLocaleString('en-IN')}` : '-'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 sm:py-4">
                                                                    <div className={`font-mono text-sm font-semibold ${Number(user.commission_earned) > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                                                        {user.commission_earned ? `₹${Number(user.commission_earned).toLocaleString('en-IN')}` : '-'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 sm:py-4 text-right">
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <span className="text-xs font-medium text-foreground">
                                                                            <FormattedDate date={user.created_at} />
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                                            Direct Recruit
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 sm:py-4 text-center rounded-r-xl md:rounded-r-2xl">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                                        onClick={() => handleOpenActionDialog(user)}
                                                                        title="Wallet Actions"
                                                                    >
                                                                        <Wallet size={16} />
                                                                    </Button>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </AnimatePresence>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="mt-auto p-4 border-t border-border bg-card rounded-b-3xl">
                                            {levelUsers?.data?.users?.last_page && levelUsers.data.users.last_page > 1 ? (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                                        Showing page {page} of {levelUsers.data.users.last_page}
                                                    </span>
                                                    <div className="flex justify-center items-center gap-2 w-full sm:w-auto">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                            disabled={page === 1}
                                                            className="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </Button>

                                                        <span className="text-sm font-medium w-20 text-center sm:hidden">
                                                            {page} / {levelUsers.data.users.last_page}
                                                        </span>

                                                        <div className="hidden sm:flex items-center gap-1">
                                                            {Array.from({ length: Math.min(5, levelUsers?.data?.users?.last_page || 0) }, (_, i) => {
                                                                const lastPage = levelUsers?.data?.users?.last_page || 0;
                                                                let pNum = i + 1;
                                                                if (lastPage > 5 && page > 3) {
                                                                    pNum = Math.min(page - 2, lastPage - 4) + i;
                                                                }
                                                                return (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setPage(pNum)}
                                                                        className={cn(
                                                                            "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                                                                            page === pNum ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {pNum}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPage((p) => Math.min(levelUsers?.data?.users?.last_page || 1, p + 1))}
                                                            disabled={page === (levelUsers?.data?.users?.last_page || 1)}
                                                            className="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-xs text-muted-foreground py-2">
                                                    Showing all {levelUsers?.data?.users?.data?.length || 0} direct referrals
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
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
