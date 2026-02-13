"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetInvestmentScheduleQuery, useGetAdminInvestmentScheduleQuery } from "@/redux/apies/investmentApi";
import { Loader2, ArrowLeft, TrendingUp, Calendar, Clock, CheckCircle2, AlertCircle, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from 'recharts';

interface InvestmentDetailsViewProps {
    investmentId: number;
    isAdmin?: boolean;
}

export default function InvestmentDetailsView({
    investmentId,
    isAdmin = false
}: InvestmentDetailsViewProps) {
    const router = useRouter();

    // User Query
    const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
        error: userError
    } = useGetInvestmentScheduleQuery(investmentId, {
        skip: !investmentId || isAdmin,
    });

    // Admin Query
    const {
        data: adminData,
        isLoading: isAdminLoading,
        isError: isAdminError,
        error: adminError
    } = useGetAdminInvestmentScheduleQuery(investmentId, {
        skip: !investmentId || !isAdmin,
    });

    // Determine which data to use
    const data = isAdmin ? adminData : userData;
    const isLoading = isAdmin ? isAdminLoading : isUserLoading;
    const isError = isAdmin ? isAdminError : isUserError;
    const error = isAdmin ? adminError : userError;

    const investment = data?.data?.investment;
    const schedule = React.useMemo(() => {
        const list = data?.data?.schedule || [];
        return [...list].sort((a: any, b: any) => new Date(a.payout_date).getTime() - new Date(b.payout_date).getTime());
    }, [data]);

    // Calculate Summary Stats
    const totalDeposited = investment ? parseFloat(investment.amount) : 0;
    const roiPercentage = investment?.roi_percentage || 10;
    const durationMonths = investment?.duration_months || 20;
    const totalExpectedReturn = (totalDeposited * roiPercentage / 100) * durationMonths;
    const monthlyPayout = totalDeposited * roiPercentage / 100;

    // Calculate Paid vs Pending
    const paidAmount = schedule
        .filter(item => item.status === 'Paid')
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const pendingAmount = schedule
        .filter(item => item.status !== 'Paid')
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const paidPercentage = totalExpectedReturn > 0 ? (paidAmount / totalExpectedReturn) * 100 : 0;

    // Prepare Chart Data
    const chartData = schedule.map((item: any, index: number) => ({
        name: `Inst ${item.installment_no || index + 1}`,
        date: new Date(item.payout_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        amount: parseFloat(item.amount),
        status: item.status,
    }));

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-semibold text-popover-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mb-2">{data.date}</p>
                    <p className="text-sm font-medium text-primary">
                        ₹{data.amount.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${data.status === 'Paid' ? 'bg-green-500' :
                            data.status === 'Processing' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                        <span className="text-xs">{data.status}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Loading Investment Details...</h2>
                <p className="text-muted-foreground">Please wait while we fetch the latest data.</p>
            </div>
        );
    }

    if (isError || !investment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Data</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    We couldn't retrieve the investment details. This might be due to a network issue or the investment ID might be incorrect.
                </p>
                {((error as any)?.data?.message || (error as any)?.message) && (
                    <p className="text-sm bg-destructive/5 text-destructive p-3 rounded-md mb-6 max-w-lg border border-destructive/20">
                        Error: {(error as any)?.data?.message || (error as any)?.message}
                    </p>
                )}
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to List
                    </Button>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                        Investment Payout Schedule
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed breakdown of ROI payouts for Reference ID: <span className="font-mono text-foreground">{investment.reference_id || 'N/A'}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant={
                        investment.status === 'approved' ? 'default' :
                            investment.status === 'rejected' ? 'destructive' : 'secondary'
                    } className="px-3 py-1 text-sm capitalize">
                        {investment.status}
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-primary/0 to-transparent shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Invested Amount</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalDeposited.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {roiPercentage}% Monthly Return
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expected Return</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">₹{totalExpectedReturn.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Over {durationMonths} Months
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid So Far</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString('en-IN')}</div>
                        <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${paidPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            {paidPercentage.toFixed(1)}% Completed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Next Payout</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{monthlyPayout.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Monthly Installment
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Payout Timeline
                            </CardTitle>
                            <CardDescription>
                                Visual representation of your investment payout schedule.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[400px] w-full">
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
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.status === 'Paid' ? '#22c55e' :
                                                            entry.status === 'Processing' ? '#eab308' : '#94a3b8'
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span>Paid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span>Processing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                                    <span>Unmatured</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* List Section */}
                <div className="lg:col-span-1">
                    <Card className="h-full border-border shadow-sm flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Schedule List
                            </CardTitle>
                            <CardDescription>
                                Detailed list of all installments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <div className="overflow-y-auto max-h-[500px] px-6 pb-6">
                                <div className="space-y-4">
                                    {schedule.length > 0 ? schedule.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-muted/50
                                                ${item.status === 'Paid' ? 'border-green-200 bg-green-50/30' :
                                                    item.status === 'Processing' ? 'border-yellow-200 bg-yellow-50/30' : 'border-border bg-card'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                                    ${item.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}
                                                `}>
                                                    {item.installment_no || index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{new Date(item.payout_date).toLocaleDateString()}</p>
                                                    <p className="text-xs text-muted-foreground">{item.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">₹{parseFloat(item.amount).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            No schedule data found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
