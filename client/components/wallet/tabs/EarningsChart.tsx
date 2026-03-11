"use client";
import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
    ResponsiveContainer,
    Legend
} from 'recharts';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface EarningsChartProps {
    history: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="font-semibold text-popover-foreground mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-muted-foreground capitalize">{entry.name}:</span>
                        <span className="text-sm font-medium text-foreground">
                            ₹{entry.value.toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}
                <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-primary">
                        ₹{(payload.reduce((sum: number, entry: any) => sum + entry.value, 0)).toLocaleString('en-IN')}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const EarningsChart = ({ history }: EarningsChartProps) => {
    const chartData = useMemo(() => {
        if (!history || !history.length) return [];

        const map = new Map();
        const sorted = [...history].sort((a: any, b: any) =>
            new Date(a.payout_date || a.created_at).getTime() - new Date(b.payout_date || b.created_at).getTime()
        );

        sorted.forEach((item: any) => {
            const date = new Date(item.payout_date || item.created_at);
            const key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

            if (!map.has(key)) {
                map.set(key, { name: key, roi: 0, referral: 0 });
            }

            const entry = map.get(key);
            const amount = Number(item.amount);
            if (item.type === 'roi') entry.roi += amount;
            else entry.referral += amount;
        });

        return Array.from(map.values());
    }, [history]);

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
                Earnings Overview
            </h3>
            <div className="h-[350px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                            <Bar dataKey="roi" name="Monthly ROI" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={40} />
                            <Bar dataKey="referral" name="Referral Bonus" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                        <BarChart3 size={40} className="mb-2 opacity-20" />
                        <p>No enough data to display chart</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(EarningsChart);
