"use client";
import React, { useState } from 'react';
import { useGetWeeklyReportQuery, useGetBonusHistoryQuery } from '@/redux/apies/payoutApi';
import { useGetTreeSummaryQuery } from '@/redux/apies/treeApi';
import { Calendar, PieChart, TrendingUp, Users, ArrowRight, Trophy, ShieldCheck, Loader2, Table as TableIcon, Filter, Search, X, ChevronDown, Rocket } from 'lucide-react';
import Loader from '@/components/common/Loader';
import RefreshButton from '@/components/common/RefreshButton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function WeeklyReportPage() {
    const now = new Date();
    const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
    const [year, setYear] = useState(String(now.getFullYear()));

    // Master Registry Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, Self Bonus, Level Bonus
    const [filterStatus, setFilterStatus] = useState('all'); // all, Paid, Approved, Unmatured

    const { data: reportData, isLoading: isReportLoading, isFetching: isReportFetching, refetch: refetchReport } = useGetWeeklyReportQuery({
        month,
        year
    });

    const { data: bonusHistoryData, isLoading: isBonusLoading, isFetching: isBonusFetching, refetch: refetchBonus } = useGetBonusHistoryQuery();

    const { data: treeSummary, isLoading: isSummaryLoading } = useGetTreeSummaryQuery();
    const totalDirectInvestment = treeSummary?.data?.summary?.total_direct_investment ?? 0;
    const unlockedLevelsCount = treeSummary?.data?.summary?.unlocked_levels ?? 1;

    // Logic for next level progress
    const nextLevelTarget = unlockedLevelsCount * 100000;
    const progressPercent = Math.min((totalDirectInvestment / nextLevelTarget) * 100, 100);

    const report = reportData?.data?.report || [];

    // Filter Logic for Master Registry
    const filteredBonusData = (bonusHistoryData?.data || []).filter(item => {
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (item.status ? item.status.toLowerCase() === filterStatus.toLowerCase() : filterStatus === 'Paid');
        // Defaulting to Paid if no status provided by API as per current UI display
        const matchesSearch = !searchTerm || item.payout_no.toString().includes(searchTerm);
        return matchesType && matchesStatus && matchesSearch;
    });

    const handleRefresh = () => {
        refetchReport();
        refetchBonus();
    };

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-8 rounded-4xl border border-border/40 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-primary/20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <PieChart className="text-primary" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">
                                Weekly <span className="text-primary italic">Performance</span>
                            </h1>
                            <p className="text-muted-foreground font-medium">Cycle-wise analysis of your earnings</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full lg:w-auto">
                    <RefreshButton
                        onRefresh={() => {
                            refetchReport();
                            refetchBonus();
                        }}
                        isRefreshing={isReportFetching || isBonusFetching}
                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-sm h-12 w-12 flex items-center justify-center rounded-2xl transition-all cursor-pointer"
                    />
                </div>
            </div>

            {/* Filter & Summary Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Filters */}
                <div className="xl:col-span-4 bg-card p-6 rounded-4xl border border-border shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={16} /> Filter Period
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-3 h-12 bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none transition-all font-medium text-slate-700 text-sm"
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full px-3 h-12 bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none transition-all font-medium text-slate-700 text-sm"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Level Unlock Status Summary */}
                <div className="xl:col-span-8">
                    <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-xs shadow-lg overflow-hidden group border-l-4 border-l-primary">
                        <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center h-full">
                            <div className="flex items-center gap-6 min-w-[280px]">
                                <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
                                    <Trophy size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Business (LVL 1)</p>
                                    <h3 className="text-3xl font-black text-foreground tabular-nums leading-none mt-1">
                                        {isSummaryLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `₹${totalDirectInvestment.toLocaleString('en-IN')}`}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2">
                                            {unlockedLevelsCount} LEVELS UNLOCKED
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Milestone Progress</p>
                                        <p className="text-xs font-semibold text-foreground">
                                            {unlockedLevelsCount < 9 ? `Unlock Level ${unlockedLevelsCount + 1} at ₹${nextLevelTarget.toLocaleString('en-IN')}` : 'All Levels Unlocked'}
                                        </p>
                                    </div>
                                    <span className="text-sm font-black text-primary">{progressPercent.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-linear-to-r from-primary via-primary/80 to-primary/40 relative"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent animate-pulse" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                                    <span>Current: ₹{totalDirectInvestment.toLocaleString('en-IN')}</span>
                                    {unlockedLevelsCount < 9 && <span>Need ₹{(nextLevelTarget - totalDirectInvestment).toLocaleString('en-IN')} more</span>}
                                </div>
                            </div>

                            <div className="hidden md:flex flex-col items-center justify-center border-l border-border pl-8 py-2">
                                <ShieldCheck className="text-green-500 mb-2" size={24} />
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest text-center leading-tight">System<br />Verified</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Report Table Section */}
            <div className="bg-card rounded-4xl border border-border shadow-2xl overflow-hidden relative group/table">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/20 via-primary to-primary/20"></div>

                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/10">
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Cycle-wise Analysis</h3>
                        <p className="text-sm text-muted-foreground font-medium">Detailed breakdown of weekly bonuses and referral income</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 uppercase tracking-widest">
                        <PieChart size={14} /> Month {month}, {year}
                    </div>
                </div>

                {isReportLoading || isReportFetching ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-6">
                        <Loader text="Generating performance metrics..." />
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-2 w-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                        </div>
                    </div>
                ) : report.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-b-2 border-border/10">
                                    <TableHead className="py-6 px-8 text-foreground font-black uppercase tracking-widest text-[11px] w-[140px]">Cycle / Range</TableHead>
                                    <TableHead className="py-6 px-8 text-foreground font-black uppercase tracking-widest text-[11px]">Date Period</TableHead>
                                    <TableHead className="py-6 px-8 text-foreground font-black uppercase tracking-widest text-[11px] text-right">Self Bonus</TableHead>
                                    <TableHead className="py-6 px-8 text-foreground font-black uppercase tracking-widest text-[11px] text-right">Referral Bonus</TableHead>
                                    <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[11px] text-right text-primary">Total Amount</TableHead>
                                    <TableHead className="py-6 px-8 text-foreground font-black uppercase tracking-widest text-[11px] text-center">Records</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.map((cycle, index) => (
                                    <TableRow
                                        key={index}
                                        className="group/row hover:bg-primary/5 transition-all duration-300 border-b border-border/40"
                                    >
                                        <TableCell className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-foreground">Cycle {cycle.cycle}</span>
                                                <Badge variant="secondary" className="w-fit text-[9px] font-bold mt-1 bg-muted group-hover/row:bg-primary/10 group-hover/row:text-primary transition-colors">
                                                    {cycle.range}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8">
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                <span className="bg-muted/50 px-2 py-1 rounded-lg border border-border/50 group-hover/row:bg-background transition-colors">{cycle.start_date}</span>
                                                <ArrowRight size={14} className="text-muted-foreground/30" />
                                                <span className="bg-muted/50 px-2 py-1 rounded-lg border border-border/50 group-hover/row:bg-background transition-colors">{cycle.end_date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-right font-bold text-slate-700 tabular-nums">
                                            ₹{Number(cycle.self_bonus).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-right font-bold text-slate-700 tabular-nums">
                                            ₹{Number(cycle.referral_bonus).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-right">
                                            <div className="inline-flex flex-col items-end">
                                                <span className="text-xl font-black text-primary tabular-nums">₹{Number(cycle.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                <div className="h-0.5 w-full bg-primary/20 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-primary w-0 group-hover/row:w-full transition-all duration-700 ease-out" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-center">
                                            <Badge className="bg-slate-900 text-white hover:bg-slate-900 px-3 py-1 font-bold italic">
                                                {cycle.count} Recs
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            {/* Summary row for Table */}
                            <tfoot className="bg-muted/40 border-t-2 border-border">
                                <tr className="hover:bg-transparent">
                                    <td colSpan={2} className="py-8 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-xl">
                                                <TrendingUp className="text-primary" size={20} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-black uppercase tracking-widest text-foreground">Monthly Accumulation</span>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Combined growth for {months.find(m => m.value === month)?.label}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-8 text-right font-black text-foreground text-lg">
                                        ₹{report.reduce((sum, c) => sum + Number(c.self_bonus), 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-8 px-8 text-right font-black text-foreground text-lg">
                                        ₹{report.reduce((sum, c) => sum + Number(c.referral_bonus), 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-8 px-8 text-right font-black text-primary text-2xl tabular-nums">
                                        ₹{report.reduce((sum, c) => sum + Number(c.total), 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-8 px-8 text-center">
                                        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-sm">
                                            <Users size={14} /> {report.reduce((sum, c) => sum + Number(c.count), 0)} Total
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    </div>
                ) : (
                    <div className="p-32 flex flex-col items-center justify-center gap-6 bg-muted/5">
                        <div className="p-8 bg-background border border-border rounded-full shadow-inner animate-pulse">
                            <PieChart className="w-16 h-16 text-muted-foreground/20" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-xl font-bold text-foreground">No Performance Data</h4>
                            <p className="text-muted-foreground max-w-xs mx-auto text-sm">Mapping growth cycles for this period yielded no results. Try selecting a different timeframe.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Master Payout Registry (All Dates) - The "Golden Table" */}
            <div className="bg-card rounded-4xl border border-amber-500/20 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-600 via-amber-400 to-amber-600"></div>

                <div className="p-8 border-b border-amber-500/10 flex flex-col gap-6 bg-amber-50/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 italic">
                                <TableIcon size={24} className="text-amber-500" />
                                Master Payout Registry
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">All Dates Historical Data • Full Team Payouts</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge className="bg-amber-600 text-white hover:bg-amber-700 border-none px-4 py-2 rounded-xl text-xs font-black tracking-tighter">
                                ALL TIME RECORDS
                            </Badge>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 p-4 rounded-3xl border border-amber-500/10 backdrop-blur-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                placeholder="Search Payout No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 h-11 bg-white border border-transparent focus:border-amber-500/30 rounded-2xl outline-none transition-all font-medium text-sm shadow-sm"
                            />
                        </div>

                        <div className="relative group">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full pl-10 pr-4 h-11 bg-white border border-transparent focus:border-amber-500/30 rounded-2xl outline-none appearance-none transition-all font-medium text-sm shadow-sm cursor-pointer"
                            >
                                <option value="all">All Bonus Types</option>
                                <option value="Self Bonus">ROI (Self Bonus)</option>
                                <option value="Level Bonus">Level Bonus</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                        </div>

                        <div className="relative">
                            <Rocket className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-10 pr-4 h-11 bg-white border border-transparent focus:border-amber-500/30 rounded-2xl outline-none appearance-none transition-all font-medium text-sm shadow-sm cursor-pointer"
                            >
                                <option value="all">Any Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Approved">Approved</option>
                                <option value="Unmatured">Unmatured</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                        </div>

                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                                setFilterStatus('all');
                            }}
                            className="h-11 flex items-center justify-center gap-2 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
                        >
                            <X size={14} /> Clear Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-amber-600">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-center border-r border-amber-500/30">LP. No</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] border-r border-amber-500/30">Type</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-center border-r border-amber-500/30">Period / ID</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-center border-r border-amber-500/30">Date</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-right border-r border-amber-500/30 font-mono">Gross Amt (₹)</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-right border-r border-amber-500/30 font-mono">TDS (5%)</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-right border-r border-amber-500/30 font-mono">Admin (10%)</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-right border-r border-amber-500/30 font-mono">Bank Amt (₹)</TableHead>
                                <TableHead className="py-6 px-4 text-white font-black uppercase tracking-tighter text-[11px] text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isBonusLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-24 text-center border-b border-amber-100/10">
                                        <Loader text="Pulling global payout history..." />
                                    </TableCell>
                                </TableRow>
                            ) : filteredBonusData.length > 0 ? (
                                filteredBonusData.map((bonus, idx) => (
                                    <TableRow key={idx} className="hover:bg-amber-500/[0.03] transition-colors border-b border-amber-100/10 group">
                                        <TableCell className="py-4 px-4 text-center font-bold text-muted-foreground border-r border-amber-100/10">{idx + 1}</TableCell>
                                        <TableCell className="py-4 px-4 border-r border-amber-100/10">
                                            <Badge variant={bonus.type === "Self Bonus" ? "default" : "secondary"} className={cn(
                                                "text-[9px] font-black uppercase px-2",
                                                bonus.type === "Level Bonus" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""
                                            )}>
                                                {bonus.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4 text-center font-mono font-bold text-amber-700 border-r border-amber-100/10">#{bonus.payout_no}</TableCell>
                                        <TableCell className="py-4 px-4 text-center font-bold text-slate-600 border-r border-amber-100/10">{bonus.date}</TableCell>
                                        <TableCell className="py-4 px-4 text-right font-black text-slate-800 border-r border-amber-100/10 tabular-nums">
                                            {bonus.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-4 px-4 text-right font-bold text-red-500 border-r border-amber-100/10 tabular-nums">
                                            {bonus.tds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-4 px-4 text-right font-bold text-orange-500 border-r border-amber-100/10 tabular-nums">
                                            {bonus.admin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-4 px-4 text-right font-black text-amber-600 border-r border-amber-100/10 tabular-nums text-lg">
                                            {bonus.bank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="py-4 px-4 text-center">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase px-2 py-1 rounded border",
                                                bonus.status?.toLowerCase() === 'unmatured' ? "text-orange-600 bg-orange-50 border-orange-100" :
                                                    bonus.status?.toLowerCase() === 'approved' ? "text-blue-600 bg-blue-50 border-blue-100" :
                                                        "text-green-600 bg-green-50 border-green-100"
                                            )}>
                                                {bonus.status || 'PAID'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-32 text-center border-b border-amber-100/10">
                                        <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                                            <PieChart size={64} />
                                            <p className="font-bold uppercase tracking-widest text-sm">Registry is currently empty</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {filteredBonusData.length > 0 && (
                            <tfoot className="bg-amber-50">
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={4} className="py-6 px-4 text-right font-black uppercase text-amber-800 tracking-widest text-[10px]">Registry Totals</TableCell>
                                    <TableCell className="py-6 px-4 text-right font-black text-slate-900 tabular-nums border-r border-amber-100/10">
                                        ₹{filteredBonusData.reduce((sum, b) => sum + b.gross, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-right font-black text-red-600 tabular-nums border-r border-amber-100/10">
                                        ₹{filteredBonusData.reduce((sum, b) => sum + b.tds, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-right font-black text-orange-600 tabular-nums border-r border-amber-100/10">
                                        ₹{filteredBonusData.reduce((sum, b) => sum + b.admin, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-right font-black text-amber-700 text-xl tabular-nums border-r border-amber-100/10">
                                        ₹{filteredBonusData.reduce((sum, b) => sum + b.bank, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="py-6 px-4"></TableCell>
                                </TableRow>
                            </tfoot>
                        )}
                    </Table>
                </div>
            </div>
        </div>
    );
}
