import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, UserCheck, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FormattedDate from '@/components/common/FormattedDate';
import { TreeUser, TreeUsersData } from '@/lib/types/referral';

interface GenerationUserListProps {
    users: TreeUsersData | undefined;
    selectedLevel: number;
    isLoading: boolean;
    page: number;
    setPage: (page: number) => void;
    onOpenActionDialog: (user: TreeUser) => void;
}

const Header = ({ selectedLevel, memberCount }: { selectedLevel: number, memberCount: number }) => (
    <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/5">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="text-xl font-bold">{selectedLevel}</span>
            </div>
            <div>
                <h2 className="text-lg font-bold text-foreground">Level {selectedLevel} Members</h2>
                <p className="text-sm text-muted-foreground">Viewing {memberCount} members</p>
            </div>
        </div>

        {/* Search - Placeholder for future implementation or prop */}
        <div className="relative w-full sm:w-64 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
            <input
                type="text"
                placeholder="Search within level..."
                className="w-full bg-background border border-border focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70 shadow-xs focus:shadow-md focus:shadow-primary/5"
            />
        </div>
    </div>
);

export const GenerationUserList: React.FC<GenerationUserListProps> = ({
    users,
    selectedLevel,
    isLoading,
    page,
    setPage,
    onOpenActionDialog
}) => {
    // Helper to get initials
    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    // Loading State
    if (isLoading) {
        return (
            <div className="bg-card rounded-3xl border border-border shadow-md min-h-[600px] flex flex-col overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-card/50 backdrop-blur-xs z-10">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                    <p className="font-medium animate-pulse">Fetching network data...</p>
                </div>
            </div>
        );
    }

    // Header Content


    // Empty State
    if (!users?.data || users.data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card rounded-3xl border border-border shadow-md min-h-[600px] flex flex-col overflow-hidden"
            >
                <Header selectedLevel={selectedLevel} memberCount={users?.data?.length || 0} />
                <div className="h-full flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 min-h-[400px]">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30 mb-6"
                    >
                        <UserCheck size={48} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No members at Level {selectedLevel} yet</h3>
                    <p className="text-sm max-w-sm text-center leading-relaxed">
                        This level is currently empty. Encourage your downline to refer others to grow your network depth.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-3xl border border-border shadow-md min-h-[600px] flex flex-col overflow-hidden"
        >
            <Header selectedLevel={selectedLevel} memberCount={users?.data?.length || 0} />

            <div className="flex-1 p-0 sm:p-2 bg-muted/5 relative">
                <div className="overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="w-full text-sm text-left border-separate border-spacing-y-1 sm:border-spacing-y-2 px-2 sm:px-4 hidden md:table">
                        <thead className="text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium tracking-wider">User Details</th>
                                <th className="px-4 py-3 font-medium tracking-wider">Contact Info</th>
                                <th className="px-4 py-3 font-medium tracking-wider text-right">Invst / Wallet</th>
                                <th className="px-4 py-3 font-medium tracking-wider text-right">Commission</th>
                                <th className="px-4 py-3 font-medium tracking-wider text-right">Joined On</th>
                                <th className="px-4 py-3 font-medium tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="pb-4">
                            <AnimatePresence mode="wait">
                                {users.data.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-card hover:bg-accent/50 transition-all duration-200 shadow-xs hover:shadow-md rounded-xl border border-border/50"
                                    >
                                        <td className="px-4 py-3 rounded-l-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-background group-hover:scale-110 transition-transform duration-300",
                                                        user.status === 'active' ? "bg-linear-to-br from-green-500 to-emerald-600 text-white" : "bg-linear-to-br from-slate-400 to-slate-500 text-white"
                                                    )}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center",
                                                        user.status === 'active' ? "bg-green-500" : "bg-slate-400"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full bg-white", user.status === 'active' && "animate-pulse")}></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">{user.name}</span>
                                                        {user.status === 'active' ? (
                                                            <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-bold border border-green-500/20 uppercase tracking-tighter">Active</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-slate-500/10 text-slate-600 px-1.5 py-0.5 rounded-full font-bold border border-slate-500/20 uppercase tracking-tighter">Inactive</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 mt-0.5">
                                                        <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">ID: {user.id}</span>
                                                        <span className="text-xs text-primary/80 font-mono bg-primary/5 px-1.5 py-0.5 rounded w-fit">Ref: {user.referral_code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
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
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {(user.investment !== undefined || user.total_investment !== undefined) ? `₹${Number(user.investment ?? user.total_investment).toLocaleString()}` : '-'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                    <Wallet size={10} />
                                                    {user.wallet_balance ? `₹${parseFloat(user.wallet_balance).toLocaleString()}` : '₹0'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-semibold font-mono ${Number(user.commission ?? user.commission_earned) > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/50'}`}>
                                                {(user.commission !== undefined || user.commission_earned !== undefined) ? `₹${Number(user.commission ?? user.commission_earned).toLocaleString()}` : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-medium text-foreground">
                                                    <FormattedDate date={user.created_at} />
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full capitalize font-medium border",
                                                    user.status === 'active'
                                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                        : "bg-red-500/10 text-red-600 border-red-500/20"
                                                )}>
                                                    {user.status || 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center rounded-r-xl">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                onClick={() => onOpenActionDialog(user)}
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

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 p-3">
                        <AnimatePresence mode="wait">
                            {users.data.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-background group-hover:scale-110 transition-transform duration-300",
                                                    user.status === 'active' ? "bg-linear-to-br from-green-500 to-emerald-600 text-white" : "bg-linear-to-br from-slate-400 to-slate-500 text-white"
                                                )}>
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center",
                                                    user.status === 'active' ? "bg-green-500" : "bg-slate-400"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full bg-white", user.status === 'active' && "animate-pulse")}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">{user.name}</span>
                                                    {user.status === 'active' ? (
                                                        <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-bold border border-green-500/20 uppercase tracking-tighter">Active</span>
                                                    ) : (
                                                        <span className="text-[10px] bg-slate-500/10 text-slate-600 px-1.5 py-0.5 rounded-full font-bold border border-slate-500/20 uppercase tracking-tighter">Inactive</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-0.5">
                                                    <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">ID: {user.id}</span>
                                                    <span className="text-xs text-primary/80 font-mono bg-primary/5 px-1.5 py-0.5 rounded w-fit">Ref: {user.referral_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                            onClick={() => onOpenActionDialog(user)}
                                            title="Wallet Actions"
                                        >
                                            <Wallet size={16} />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30">
                                            <span className="text-muted-foreground">Email</span>
                                            <span className="font-medium truncate">{user.email}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30">
                                            <span className="text-muted-foreground">Phone</span>
                                            <span className="font-medium truncate">{user.phone_number}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Investment</span>
                                            <span className="text-sm font-semibold text-foreground">
                                                {(user.investment !== undefined || user.total_investment !== undefined) ? `₹${Number(user.investment ?? user.total_investment).toLocaleString()}` : '-'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Wallet size={10} />
                                                {user?.wallet_balance ? `₹${parseFloat(user?.wallet_balance).toLocaleString()}` : '₹0'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-muted-foreground">Commission</span>
                                            <span className={`text-sm font-semibold font-mono ${Number(user.commission ?? user.commission_earned) > 0 ? 'text-green-600' : 'text-muted-foreground/50'}`}>
                                                {(user.commission !== undefined || user.commission_earned !== undefined) ? `₹${Number(user.commission ?? user.commission_earned).toLocaleString()}` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                        <span>Joined: <FormattedDate date={user.created_at} /></span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border",
                                            user.status === 'active'
                                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                : "bg-red-500/10 text-red-600 border-red-500/20"
                                        )}>
                                            {user.status || 'Inactive'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer / Pagination */}
                <div className="mt-auto p-4 border-t border-border bg-card rounded-b-3xl">
                    {users.last_page && users.last_page > 1 ? (
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                Showing page {page} of {users.last_page}
                            </span>
                            <div className="flex justify-center items-center gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </Button>

                                <span className="text-sm font-medium w-20 text-center sm:hidden">
                                    {page} / {users.last_page}
                                </span>

                                {/* Simple Page Numbers for Desktop */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, users.last_page || 0) }, (_, i) => {
                                        let pNum = i + 1;
                                        const lastPage = users.last_page || 0;
                                        if (lastPage > 5 && page > 3) {
                                            pNum = page - 2 + i;
                                            // prevent going over lastPage
                                            if (pNum > lastPage) {
                                                pNum = lastPage - (4 - i);
                                            }
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
                                    onClick={() => setPage(Math.min(users.last_page || 1, page + 1))}
                                    disabled={page === (users.last_page || 1)}
                                    className="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-muted-foreground py-2">
                            Showing all {users.data.length} results
                        </div>
                    )}
                </div>
            </div>
        </motion.div >
    );
};
