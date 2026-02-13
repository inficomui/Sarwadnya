"use client";

import React, { useState } from "react";
import { Filter, Search, MoreHorizontal, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RefreshButton from "@/components/common/RefreshButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function OrdersPage() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            router.refresh();
            setIsRefreshing(false);
        }, 800);
    };

    const orders = [
        { id: "#ORD-001", user: "Alice Johnson", amount: "₹50,000", status: "Completed", date: "2023-10-25" },
        { id: "#ORD-002", user: "Bob Smith", amount: "₹1,00,000", status: "Pending", date: "2023-10-26" },
        { id: "#ORD-003", user: "Charlie Davis", amount: "₹25,000", status: "Failed", date: "2023-10-27" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Order History</h1>
                    <p className="text-muted-foreground text-sm">View and manage all investment orders.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <RefreshButton
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        className="w-full sm:w-auto"
                        label="Refresh"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="default" className="w-full sm:w-auto">
                                <Filter className="w-4 h-4 ml-2" />
                                <span>Filter</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Filter Orders</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/30">
                                <td className="px-6 py-4 font-mono">{order.id}</td>
                                <td className="px-6 py-4 font-medium">{order.user}</td>
                                <td className="px-6 py-4">{order.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                                        order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' :
                                            'bg-red-500/10 text-red-600'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>More Actions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
