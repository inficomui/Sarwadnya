import React from 'react';
import Link from 'next/link';
import { LucideIcon, ChevronRight, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface MenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
    disabled?: boolean;
}

interface DashboardMenuSectionProps {
    title: string;
    color: string; // Background color class for header, e.g., "bg-red-600"
    items: MenuItem[];
    className?: string;
}

export const DashboardMenuSection: React.FC<DashboardMenuSectionProps> = React.memo(({
    title,
    color,
    items,
    className
}) => {
    return (
        <Card className={`overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col group/card bg-white dark:bg-slate-950 ${className || ""}`}>
            <CardHeader className="py-5 px-6 relative overflow-hidden">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 opacity-10 dark:opacity-20 transition-opacity ${color}`} />
                <div className={`absolute inset-0 opacity-90 mix-blend-multiply dark:mix-blend-overlay ${color}`} />
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000" />

                <CardTitle className="relative z-10 text-white text-lg font-bold flex items-center gap-2">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 bg-white dark:bg-slate-950">
                <div className="flex flex-col h-full divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, index) => {
                        const ItemWrapper = item.disabled ? 'div' : Link;
                        const itemProps = item.disabled ? {
                            onClick: () => toast.error("Please top up your account to access this feature.")
                        } : {
                            href: item.href
                        };

                        return (
                            <ItemWrapper
                                key={index}
                                {...(itemProps as any)}
                                className={`flex items-center justify-between px-6 py-4 transition-colors duration-200 group/item relative overflow-hidden cursor-pointer ${item.disabled ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/50 grayscale" : "hover:bg-slate-50 dark:hover:bg-slate-900"
                                    }`}
                            >
                                {!item.disabled && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-transparent via-orange-500 to-transparent scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300" />
                                )}

                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg transition-all duration-300 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${!item.disabled ? "group-hover/item:bg-white group-hover/item:text-orange-600 dark:group-hover/item:bg-slate-800 dark:group-hover/item:text-orange-400 group-hover/item:shadow-sm ring-1 ring-transparent group-hover/item:ring-slate-200 dark:group-hover/item:ring-slate-700" : ""
                                        }`}>
                                        <item.icon size={18} strokeWidth={2} />
                                    </div>
                                    <span className={`font-medium text-sm transition-all duration-200 text-slate-600 dark:text-slate-300 ${!item.disabled ? "group-hover/item:text-slate-900 dark:group-hover/item:text-white group-hover/item:translate-x-1" : ""
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                                {item.disabled ? (
                                    <Lock size={16} className="text-slate-400" />
                                ) : (
                                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 group-hover/item:text-orange-500 transition-colors" />
                                )}
                            </ItemWrapper>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
});

DashboardMenuSection.displayName = "DashboardMenuSection";
