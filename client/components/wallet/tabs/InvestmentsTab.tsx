"use client";
import React from 'react';
import { TrendingUp, Clock, FileText, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import FormattedDate from '@/components/common/FormattedDate';
import Loader from '@/components/common/Loader';

interface InvestmentsTabProps {
    transfersData: any;
    isLoading: boolean;
}

const InvestmentsTab = ({ transfersData, isLoading }: InvestmentsTabProps) => {
    const investments = transfersData?.data?.transfers || [];

    const approvedInvestments = investments.filter((i: any) => i.status === 'approved');
    const totalApproved = approvedInvestments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    const pendingInvestments = investments.filter((i: any) => i.status === 'pending');
    const totalPending = pendingInvestments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    if (isLoading) {
        return <Loader center text="Loading investment history..." className="py-12" />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* Summary Section */}
                <div className="p-8 bg-linear-to-br from-green-500/20 via-green-500/5 to-transparent border-b border-green-500/10">
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                                <DollarSign size={20} />
                                <span>Total Approved Investments</span>
                            </div>
                            <h2 className="text-4xl xs:text-5xl font-bold text-foreground">
                                ₹{totalApproved.toLocaleString('en-IN')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Across {approvedInvestments.length} successful transaction{approvedInvestments.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {totalPending > 0 && (
                            <div className="bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 px-5 py-3 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-full text-orange-600">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">Pending Approval</p>
                                    <p className="text-lg font-bold text-orange-700 dark:text-orange-300">₹{totalPending.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText size={20} className="text-muted-foreground" />
                            Investment History
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            {investments.length} Records
                        </span>
                    </div>

                    <div className="space-y-3">
                        {investments.length === 0 ? (
                            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                                <TrendingUp size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground font-medium">No investments found</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">Start your journey by making a new investment.</p>
                            </div>
                        ) : (
                            investments.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                        <div className={`p-3 rounded-xl shrink-0 mt-1 md:mt-0 ${item.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                            item.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                'bg-orange-500/10 text-orange-600'
                                            }`}>
                                            {item.status === 'approved' ? <CheckCircle2 size={20} /> :
                                                item.status === 'rejected' ? <XCircle size={20} /> :
                                                    <Clock size={20} />}
                                        </div>

                                        <div className="space-y-1 w-full">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-foreground">
                                                    {item.method}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-green-500/10 text-green-600 border border-green-500/10' :
                                                    item.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/10' :
                                                        'bg-orange-500/10 text-orange-600 border border-orange-500/10'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <FormattedDate date={item.created_at} />
                                                </span>
                                                {item.reference_id && (
                                                    <span className="font-mono opacity-80">
                                                        Ref: {item.reference_id}
                                                    </span>
                                                )}
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-muted-foreground/80 italic mt-1 line-clamp-1">
                                                    "{item.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto md:block text-right">
                                        <p className="text-sm text-muted-foreground md:hidden">Amount</p>
                                        <p className="text-xl font-bold font-mono text-foreground">
                                            ₹{Number(item.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(InvestmentsTab);
