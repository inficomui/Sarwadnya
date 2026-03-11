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

interface SidebarItemType {
    label: string;
    href: string;
    icon: React.ElementType;
    subItems?: SidebarItemType[];
}

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    items: SidebarItemType[];
    user?: {
        id?: number;
        name?: string;
        email?: string;
        role?: 'admin' | 'user';
        referral_code?: string;
    };
    onLogout: () => void;
    isMobileOpen: boolean;
    closeMobileSidebar: () => void;
    isLoggingOut?: boolean;
}

const SidebarItem = React.memo(({
    item,
    isCollapsed,
    pathname,
    isMobileOpen,
    closeMobileSidebar,
    setHoveredTooltip
}: {
    item: SidebarItemType;
    isCollapsed: boolean;
    pathname: string;
    isMobileOpen: boolean;
    closeMobileSidebar: () => void;
    setHoveredTooltip: (val: any) => void;
}) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isParentActive = (item.href === '/admin/dashboard' || item.href === '/dashboard' || item.href === '#')
        ? false
        : pathname.startsWith(item.href);

    const isChildActive = useMemo(() =>
        item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/')),
        [item.subItems, pathname]);

    const [isExpanded, setIsExpanded] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setIsExpanded(true);
    }, [isChildActive]);

    const isActive = isParentActive || isChildActive;

    const handleParentClick = (e: React.MouseEvent) => {
        if (hasSubItems) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
        if (isMobileOpen && !hasSubItems) closeMobileSidebar();
    };

    const ParentElement: any = hasSubItems ? 'div' : Link;

    return (
        <React.Fragment>
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

                {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 flex-1">
                        {item.label}
                    </span>
                )}

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
                <div className="ml-5 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 mb-2">
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
                                <span className="truncate">{subItem.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
});
SidebarItem.displayName = "SidebarItem";

const Sidebar = ({
    isCollapsed,
    toggleCollapse,
    items,
    user,
    onLogout,
    isMobileOpen,
    closeMobileSidebar,
    isLoggingOut = false,
}: SidebarProps) => {
    const pathname = usePathname();
    const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number; left: number } | null>(null);

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

            <div
                className={cn(
                    "fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 shadow-2xl overflow-hidden",
                    "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800",
                    "md:sticky md:top-0 md:translate-x-0",
                    isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0",
                    isCollapsed ? "md:w-[80px]" : "md:w-[280px]"
                )}
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

                <div className="h-20 flex items-center justify-center px-4 border-b border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
                    <Link
                        href="/"
                        onClick={() => isMobileOpen && closeMobileSidebar()}
                        className="relative flex items-center justify-center w-full h-full"
                    >
                        {!isCollapsed ? (
                            <div className="relative w-52 h-16 dark:bg-white dark:rounded-lg">
                                <Image
                                    src={LOGO.src}
                                    alt="Logo"
                                    fill
                                    className="object-contain dark:p-1"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                                S
                            </div>
                        )}
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {items.map((item) => (
                        <SidebarItem
                            key={item.label}
                            item={item}
                            isCollapsed={isCollapsed}
                            pathname={pathname}
                            isMobileOpen={isMobileOpen}
                            closeMobileSidebar={closeMobileSidebar}
                            setHoveredTooltip={setHoveredTooltip}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto shrink-0">
                    <Link href="/dashboard/profile">
                        <div className={cn(
                            "flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm group",
                            isCollapsed ? "justify-center px-0" : ""
                        )}>
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-amber-300 flex items-center justify-center text-primary-foreground shrink-0 shadow-md ring-2 ring-white dark:ring-slate-800 overflow-hidden">
                                {user?.name ? (
                                    <span className="font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                                ) : <UserCircle size={24} />}
                            </div>

                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                        {user?.name || 'User'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 truncate">ID: {user?.id}</span>
                                </div>
                            )}
                        </div>
                    </Link>

                    <button
                        onClick={onLogout}
                        disabled={isLoggingOut}
                        className={cn(
                            "w-full mt-3 flex items-center justify-center gap-2 h-10 rounded-xl transition-all duration-200 group text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium",
                            isCollapsed ? "px-0" : "px-4",
                            isLoggingOut && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                        {!isCollapsed && <span className="text-sm">{isLoggingOut ? "Exiting..." : "Sign Out"}</span>}
                    </button>
                </div>
            </div>

            {isCollapsed && hoveredTooltip && (
                <div
                    className="fixed z-100 bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
                    style={{
                        top: hoveredTooltip.top,
                        left: hoveredTooltip.left,
                        transform: 'translateY(-50%)'
                    }}
                >
                    {hoveredTooltip.label}
                </div>
            )}
        </>
    );
};

export default React.memo(Sidebar);
