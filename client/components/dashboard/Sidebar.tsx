"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, ChevronLeft, ChevronRight, UserCircle, X, Loader2,
} from 'lucide-react';
import LOGO from '@/public/sarwadnya-nav-logo.jpeg';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { DistributorProfileCard } from '@/components/dashboard/DistributorProfileCard';

interface SidebarItem {
    label: string;
    href: string;
    icon: React.ElementType;
    subItems?: SidebarItem[];
}

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    items: SidebarItem[];
    user?: {
        id?: number;
        name?: string;
        email?: string;
        role?: 'admin' | 'user';
        referral_code?: string;
    };
    distributorData?: {
        profile?: any;
        referral?: any;
        account?: any;
    };
    onLogout: () => void;
    isMobileOpen: boolean;
    closeMobileSidebar: () => void;
    isLoggingOut?: boolean;
}

const Sidebar = ({
    isCollapsed,
    toggleCollapse,
    items,
    user,
    distributorData,
    onLogout,
    isMobileOpen,
    closeMobileSidebar,
    isLoggingOut = false,
}: SidebarProps) => {
    const pathname = usePathname()
    const memoizedItems = useMemo(() => items, [items]);
    const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number; left: number } | null>(null);

    const sidebarVariants = {
        expanded: { width: "280px" },
        collapsed: { width: "80px" }
    };

    return (
        <>
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobileSidebar}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.div
                className={cn(
                    "fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 shadow-2xl",
                    "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800",
                    "md:sticky md:top-0 md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
                variants={sidebarVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
                initial={false}
            >
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-10 z-50 h-7 w-7 rounded-full bg-primary text-primary-foreground md:flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all hidden border-2 border-white dark:border-slate-900"
                >
                    {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
                </button>

                {isMobileOpen && (
                    <button
                        onClick={closeMobileSidebar}
                        className="absolute top-4 right-4 md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className={cn(
                    "h-full flex flex-col w-full overflow-hidden",
                    isMobileOpen ? "w-[280px]" : ""
                )}>
                    <div className="h-20 flex items-center justify-center px-4 border-b border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <Link
                            href="/"
                            onClick={() => isMobileOpen && closeMobileSidebar()}
                            className="relative flex items-center justify-center w-full h-full"
                        >
                            {/* Full Logo */}
                            <div className={cn(
                                "transition-all duration-500 absolute inset-0 flex items-center justify-center",
                                isCollapsed ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
                            )}>
                                <div className="relative w-52 h-16 dark:bg-white dark:rounded-lg transition-all">
                                    <Image
                                        src={LOGO.src}
                                        alt="Shree Sarwadnya All in one Solutions"
                                        fill
                                        className="object-contain dark:p-1"
                                        priority
                                    />
                                </div>
                            </div>

                            <div className={cn(
                                "transition-all duration-500 absolute inset-0 flex items-center justify-center",
                                !isCollapsed ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
                            )}>
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                                    S
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        {memoizedItems.map((item) => {
                            const isParentActive = (item.href === '/admin/dashboard' || item.href === '/dashboard' || item.href === '#')
                                ? false
                                : pathname.startsWith(item.href);

                            const isChildActive = item.subItems?.some(sub => pathname.startsWith(sub.href));

                            const [isExpanded, setIsExpanded] = useState(isChildActive);

                            useEffect(() => {
                                if (isChildActive) setIsExpanded(true);
                            }, [pathname, isChildActive]);

                            const isActive = isParentActive || isChildActive;
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            const handleParentClick = (e: React.MouseEvent) => {
                                if (hasSubItems) {
                                    e.preventDefault();
                                    setIsExpanded(!isExpanded);
                                }
                                if (isMobileOpen && !hasSubItems) closeMobileSidebar();
                            };

                            const ParentElement: any = hasSubItems ? 'div' : Link;

                            return (
                                <React.Fragment key={item.label}>
                                    <ParentElement
                                        href={hasSubItems ? undefined : item.href || "#"}
                                        onClick={handleParentClick}
                                        onMouseEnter={(e: React.MouseEvent) => {
                                            if (isCollapsed) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setHoveredTooltip({
                                                    label: item.label,
                                                    top: rect.top + rect.height / 2,
                                                    left: rect.right + 10
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => setHoveredTooltip(null)}
                                        className={cn(
                                            "flex items-center h-11 px-3.5 rounded-xl transition-all duration-200 group relative cursor-pointer select-none mb-1",
                                            isActive && !hasSubItems
                                                ? "bg-linear-to-r from-primary to-amber-300 text-primary-foreground shadow-lg shadow-primary/20"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                                            isActive && hasSubItems ? "text-primary dark:text-primary font-medium" : ""
                                        )}
                                    >
                                        <div className="min-w-[24px] flex items-center justify-center">
                                            <item.icon
                                                size={20}
                                                strokeWidth={isActive && !hasSubItems ? 2.5 : 2}
                                                className={cn(
                                                    "transition-colors",
                                                    isActive && !hasSubItems ? "text-primary-foreground" : "text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary"
                                                )}
                                            />
                                        </div>

                                        <span className={cn(
                                            "ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 flex-1",
                                            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                                        )}>
                                            {item.label}
                                        </span>

                                        {hasSubItems && !isCollapsed && (
                                            <div className="mr-1 text-slate-400">
                                                <ChevronRight
                                                    size={16}
                                                    className={cn("transition-transform duration-200", isExpanded ? "rotate-90" : "")}
                                                />
                                            </div>
                                        )}
                                    </ParentElement>

                                    {hasSubItems && isExpanded && !isCollapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-5 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 mb-2 overflow-hidden"
                                        >
                                            {item.subItems!.map((subItem) => {
                                                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                                                return (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        onClick={() => isMobileOpen && closeMobileSidebar()}
                                                        className={cn(
                                                            "flex items-center h-10 px-3 rounded-lg transition-all duration-200 text-sm",
                                                            isSubActive
                                                                ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary font-medium"
                                                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                        )}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-3 opacity-50" />
                                                        <span className="truncate">
                                                            {subItem.label}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            );
                        })}

                    </div>
                    <div className="p-4 border-t border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
                        <Link href="/dashboard/profile">
                            <div className={cn(
                                "flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm group",
                                isCollapsed ? "justify-center px-0" : ""
                            )}>
                                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-amber-300 flex items-center justify-center text-primary-foreground shrink-0 shadow-md ring-2 ring-white dark:ring-slate-800">
                                    {user?.name ? (
                                        <span className="font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                                    ) : <UserCircle size={24} />}
                                </div>

                                <div className={cn(
                                    "flex flex-col overflow-hidden transition-all duration-300",
                                    isCollapsed ? "hidden" : "flex"
                                )}>
                                    <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                        {user?.name || 'User'}
                                    </span>
                                    <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400 gap-0.5">
                                        <span className="truncate max-w-[140px]">{user?.email || 'View Profile'}</span>
                                        {user?.id && <span className="font-mono text-[10px] opacity-75">ID: {user.id}</span>}
                                        {user?.referral_code && <span className="font-mono text-[10px] text-primary dark:text-primary font-medium tracking-wide">Ref: {user.referral_code}</span>}
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <button
                            onClick={() => onLogout()}
                            onMouseEnter={(e) => {
                                if (isCollapsed) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredTooltip({
                                        label: "Sign Out",
                                        top: rect.top + rect.height / 2,
                                        left: rect.right + 10
                                    });
                                }
                            }}
                            onMouseLeave={() => setHoveredTooltip(null)}
                            disabled={isLoggingOut}
                            className={cn(
                                "w-full mt-3 flex items-center justify-center gap-2 h-10 rounded-xl transition-all duration-200 group relative",
                                "hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium",
                                isCollapsed ? "px-0" : "px-4",
                                isLoggingOut && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                            <span className={cn(
                                "transition-all duration-300 whitespace-nowrap text-sm",
                                isCollapsed ? "hidden" : "block"
                            )}>
                                {isLoggingOut ? "Exiting..." : "Sign Out"}
                            </span>
                        </button>
                    </div>
                </div>
                {isCollapsed && hoveredTooltip && (
                    <div
                        className="fixed z-100 bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            top: hoveredTooltip.top,
                            left: hoveredTooltip.left,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        {hoveredTooltip.label}
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default Sidebar;
