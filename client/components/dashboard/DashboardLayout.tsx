"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, AlertTriangle, Lock } from 'lucide-react';
import { ModeToggle } from '@/components/ui/ModeToggle';
import NextImage from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleSidebar } from '@/redux/slices/uiSlice';
import { usePathname, useRouter } from 'next/navigation';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';

interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebarItems: Array<{ label: string; href: string; icon: any }>;
    user?: {
        name?: string;
        email?: string;
        role?: 'admin' | 'user';
    };
    onLogout: () => void;
    isLoggingOut?: boolean;
}

const DashboardLayout = ({ children, sidebarItems, user, onLogout, isLoggingOut = false }: DashboardLayoutProps) => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const { isSidebarCollapsed } = useSelector((state: RootState) => state.ui);
    const { data: dashboardData } = useGetUserDashboardQuery();

    const earningLimit = dashboardData?.data?.earning_limit;
    const isLimitReached = earningLimit?.reached;

    // Allowed paths when limit is reached
    // We compare strict starts for sub-routes
    const allowedRootPaths = ['/dashboard/profile', '/dashboard/investments'];
    const isDashboardRoot = pathname === '/dashboard';

    // Check if current path is allowed
    const isAllowedPath = isDashboardRoot || allowedRootPaths.some(path => pathname.startsWith(path));

    // Redirect if earning limit is reached and path is not allowed
    useEffect(() => {
        if (isLimitReached && !isAllowedPath) {
            router.push('/dashboard');
        }
    }, [isLimitReached, isAllowedPath, pathname, router]);


    // Filter sidebar items based on limit only
    const filteredSidebarItems = isLimitReached
        ? sidebarItems.filter(item =>
            item.href === '/dashboard' ||
            allowedRootPaths.some(allowed => item.href.startsWith(allowed))
        )
        : sidebarItems;

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => dispatch(toggleSidebar())}
                items={filteredSidebarItems}
                user={user}
                onLogout={onLogout}
                isMobileOpen={isMobileSidebarOpen}
                closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
                isLoggingOut={isLoggingOut}
                distributorData={{
                    profile: dashboardData?.data?.profile,
                    referral: dashboardData?.data?.referral,
                    account: dashboardData?.data?.account
                }}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Navigation Header */}
                <header className={`h-[80px] flex items-center justify-between px-6 shrink-0 z-40 transition-all duration-300 ${scrolled
                    ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
                    : "bg-transparent"
                    }`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                Dashboard
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                                Welcome back, {user?.name?.split(' ')[0] || 'User'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-white dark:bg-slate-900 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-800 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all w-64 shadow-sm">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                            />
                        </div>

                        <button className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-primary dark:text-slate-400 transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-950"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

                        <ModeToggle />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <div className="max-w-7xl mx-auto w-full space-y-6">
                        {/* Global Warning Implementation */}
                        {isLimitReached && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm">Action Required</h3>
                                        <p className="text-red-700 dark:text-red-300 text-xs mt-0.5">
                                            {earningLimit.message} Some features are currently locked.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* If status is reached and current path is NOT allowed (and not redirected yet), block content */}
                        {isLimitReached && !isAllowedPath ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full">
                                    <Lock size={48} className="text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Restricted</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                    You have reached your 2x earning limit. Please re-invest to unlock all dashboard features and continue earning.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* No Investment Warning */}
                                {(dashboardData?.data?.financials?.total_deposited === 0 || dashboardData?.data?.profile?.is_payout_restricted) && !isLimitReached && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400 shrink-0">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Account Activation Required</h3>
                                                <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                                                    {dashboardData?.data?.profile?.is_payout_restricted
                                                        ? "Your payouts have been restricted. Please contact support."
                                                        : "You currently have no active investments. Please make an investment to activate your account and receive payouts. Zero investment accounts may be deactivated."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {children}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
