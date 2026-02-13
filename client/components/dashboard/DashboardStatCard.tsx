import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStatCardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    icon?: LucideIcon;
    color: string; // expects a background color class, e.g. "bg-purple-500"
    className?: string;
    delay?: number;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    className,
    delay = 0
}) => {
    // Extract color name safely if simple format (e.g. bg-red-500 -> red)
    // This is a naive extraction for opacity utils

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            whileHover={{ y: -5 }}
        >
            <Card className={cn(
                "overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 relative group",
                "bg-white dark:bg-slate-950",
                className
            )}>
                <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-3 relative z-10">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {title}
                            </h3>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {value}
                                </div>
                                {subtitle && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {Icon && (
                            <div className={cn(
                                "p-3 rounded-xl transition-all group-hover:scale-110 duration-300 shadow-sm",
                                color, // Background color
                                "text-white shadow-lg"
                            )}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                        )}
                    </div>

                    {/* Decorative Background Elements */}
                    <div className={cn(
                        "absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 transition-transform duration-500 ease-in-out",
                        color.replace('bg-', 'bg-') // Ensure it uses the bg color
                    )} />
                </CardContent>
            </Card>
        </motion.div>
    );
};
