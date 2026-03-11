"use client";
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Payout } from '@/lib/types/finance';
import FormattedDate from '@/components/common/FormattedDate';
import PayoutSlipDialog from './PayoutSlipDialog';

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayoutDetailsTableProps {
    payouts: Payout[];
}

const PayoutDetailsTable: React.FC<PayoutDetailsTableProps> = ({ payouts }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(null);
    const [isSlipOpen, setIsSlipOpen] = React.useState(false);

    // Reset to first page when payouts change or rows per page changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [payouts, rowsPerPage]);

    const totalPages = Math.ceil(payouts.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedPayouts = payouts.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all hover:shadow-2xl flex flex-col min-h-[600px]">
            {/* Header with application gold theme */}
            <div className="bg-linear-to-r from-[#B8860B] to-[#DAA520] text-white px-8 py-6 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold italic tracking-wide font-heading">Payout Details</h2>
                    <p className="text-sm text-white/80 mt-1">Detailed breakdown of your bonus earnings</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 hidden md:block">
                    <span className="text-sm font-medium">Total Records: {payouts.length}</span>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <Table>
                    <TableHeader className="bg-[#2D2412] hover:bg-[#2D2412] sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Sr. No.</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Type</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Payout No.</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Date</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Gross</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">TDS</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Admin</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Net Amt</TableHead>
                            <TableHead className="text-primary font-bold text-center border-r border-[#4A3B1D] py-4">Status</TableHead>
                            <TableHead className="text-primary font-bold text-center py-4">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPayouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-32">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                            <Search className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xl font-bold text-foreground">No Payouts Found</p>
                                            <p className="text-sm">Try adjusting your date range or filters</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedPayouts.map((payout, index) => (
                                <TableRow
                                    key={payout.id}
                                    className={index % 2 === 0 ? "bg-[#FBFAF3] hover:bg-[#F5F2E1] transition-colors" : "bg-white hover:bg-slate-50 transition-colors"}
                                >
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] font-medium text-slate-600">{startIndex + index + 1}</TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0]">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${payout.type === 'roi'
                                            ? 'bg-blue-100/80 text-blue-700 border border-blue-200'
                                            : 'bg-amber-100/80 text-amber-700 border border-amber-200'
                                            }`}>
                                            {payout.type === 'roi' ? 'Self Bonus' : 'Level Bonus'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] font-mono text-slate-700 group relative">
                                        <span className="cursor-help underline decoration-dotted decoration-border underline-offset-4">{payout.id}</span>
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] font-medium text-slate-700">
                                        <FormattedDate date={payout.payout_date || payout.created_at} />
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] font-bold text-slate-800">
                                        ₹{Number(payout.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] text-red-600 font-medium bg-red-50/10">
                                        ₹{Number(payout.tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] text-red-600 font-medium bg-red-50/10">
                                        ₹{Number(payout.admin_charges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0] text-green-700 font-bold bg-green-50/10">
                                        ₹{Number(payout.net_amount || (Number(payout.amount) - Number(payout.tds || 0) - Number(payout.admin_charges || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center py-4 border-r border-[#E5E2D0]">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${payout.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {payout.status || 'Processing'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-4 px-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={payout.status?.toLowerCase() === 'unmatured'}
                                            onClick={() => {
                                                setSelectedPayout(payout);
                                                setIsSlipOpen(true);
                                            }}
                                            className="border-primary/20 text-primary hover:bg-primary hover:text-white h-8 px-4 font-bold text-[10px] tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
                                        >
                                            VIEW SLIP
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination & Summary Footer */}
            <div className="bg-[#2D2412] p-6 text-white flex flex-col md:flex-row gap-6 justify-between items-center shrink-0 border-t border-white/10">
                {/* Pagination Controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-primary/80 font-medium hidden sm:inline">Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                        >
                            {[5, 10, 25, 50].map(size => (
                                <option key={size} value={size} className="text-black">{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 text-primary hover:bg-white/10 disabled:opacity-20"
                        >
                            <ChevronsLeft size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 text-primary hover:bg-white/10 disabled:opacity-20"
                        >
                            <ChevronLeft size={16} />
                        </Button>

                        <div className="flex items-center gap-2 px-3 h-8 bg-white/10 rounded-lg text-xs font-bold border border-white/5">
                            <span className="text-primary">{currentPage}</span>
                            <span className="opacity-40">/</span>
                            <span>{totalPages || 1}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 w-8 text-primary hover:bg-white/10 disabled:opacity-20"
                        >
                            <ChevronRight size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 w-8 text-primary hover:bg-white/10 disabled:opacity-20"
                        >
                            <ChevronsRight size={16} />
                        </Button>
                    </div>
                </div>

                {/* Totals Summary */}
                <div className="flex items-center gap-8">
                    <div className="items-end border-r border-white/10 pr-8 hidden sm:flex flex-col">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80">Total Gross</span>
                        <span className="text-lg font-bold">
                            ₹{payouts.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80">Net Total Payable</span>
                        <span className="text-3xl font-black text-white drop-shadow-sm">
                            ₹{payouts.reduce((sum, p) => sum + Number(p.net_amount || (Number(p.amount) - Number(p.tds || 0) - Number(p.admin_charges || 0))), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
            {/* Payout Slip Dialog */}
            <PayoutSlipDialog
                isOpen={isSlipOpen}
                onClose={() => setIsSlipOpen(false)}
                payout={selectedPayout}
            />
        </div>
    );
};

export default PayoutDetailsTable;
