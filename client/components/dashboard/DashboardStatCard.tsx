import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    className?: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = React.memo(({
    title,
    value,
    icon: Icon,
    color,
    trend,
    subtitle,
    className
}) => {
    return (
        <div className={`bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group animate-in fade-in zoom-in-95 duration-500 ${className || ""}`}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {value}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shrink-0 ${color} text-white shadow-current/20`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend.isUp ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                        {trend.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trend.value}
                    </div>
                </div>
            )}
        </div>
    );
});

DashboardStatCard.displayName = "DashboardStatCard";

export default DashboardStatCard;
