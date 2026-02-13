"use client";

import React from "react";
import { DollarSign, Download, TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RevenuePage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Financial Overview</h1>
                    <p className="text-muted-foreground text-sm">Track revenue, withdrawals, and investment growth.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="default">
                        <Calendar size={16} />
                        <span>This Month</span>
                    </Button>
                    <Button variant="default" size="default">
                        <Download size={16} />
                        <span>Export Report</span>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 text-green-600 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-green-600 bg-green-500/10 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} /> +12.5%
                        </span>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold font-mono mt-1">₹24,50,000</p>
                </div>
                {/* More stat cards... */}
            </div>

            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">Detailed Analytics Coming Soon</h3>
                <p>We are building detailed financial charts and reporting tools.</p>
            </div>
        </div>
    );
}
