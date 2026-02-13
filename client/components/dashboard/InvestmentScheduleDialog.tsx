import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useGetInvestmentScheduleQuery } from '@/redux/apies/investmentApi';
// Add Button import at top if not exists, but I'll replace the full component block logic to be safe or use huge chunks.
// Actually I'll use replace_file_content for imports and then multi_replace for the logic.

// Wait, replace_file_content is for SINGLE CONTIGUOUS BLOCK.
// I have to adding imports AND adding the function AND adding screen logic. These are non-contiguous.
// But the tool says: "Use this tool ONLY when you are making a SINGLE CONTIGUOUS block of edits"
// So I should use multi_replace.

// BUT, I can just replace the whole file? No, that's expensive.
// I'll use multi_replace.

// Imports:
import { Loader2, Calendar, CheckCircle2, Circle, Clock, Printer } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface InvestmentScheduleDialogProps {
    investmentId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function InvestmentScheduleDialog({
    investmentId,
    open,
    onOpenChange
}: InvestmentScheduleDialogProps) {
    const { data: scheduleData, isLoading, isError } = useGetInvestmentScheduleQuery(
        investmentId!,
        { skip: !investmentId || !open }
    );

    const investment = scheduleData?.data.investment;
    const schedule = scheduleData?.data.schedule || [];

    const handlePrintReceipt = (installment: any) => {
        if (!installment.transaction_id) {
            console.log("No transaction ID available");
            return;
        }

        console.log("Printing receipt for transaction:", installment.transaction_id);

        const printWindow = window.open('', '_blank', 'width=600,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt #${installment.transaction_id}</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
                            .logo { font-size: 24px; font-weight: bold; color: #d97706; margin-bottom: 5px; }
                            .title { font-size: 18px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
                            .content { background: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #eee; }
                            .row { display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
                            .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                            .label { font-weight: 600; color: #666; }
                            .value { font-weight: 500; }
                            .amount { font-size: 18px; font-weight: bold; color: #059669; }
                            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo">Shree Sarwadnya All in one Solutions</div>
                            <div class="title">Payout Receipt</div>
                        </div>
                        <div class="content">
                            <div class="row">
                                <span class="label">Transaction ID</span>
                                <span class="value font-mono">#${installment.transaction_id}</span>
                            </div>
                            <div class="row">
                                <span class="label">Date</span>
                                <span class="value">${new Date(installment.payout_date).toLocaleDateString()}</span>
                            </div>
                            <div class="row">
                                <span class="label">Installment</span>
                                <span class="value">#${installment.installment_no}</span>
                            </div>
                            <div class="row">
                                <span class="label">Status</span>
                                <span class="value" style="color: #059669;">Success</span>
                            </div>
                            <div class="row">
                                <span class="label">Amount Paid</span>
                                <span class="value amount">₹${parseFloat(installment.amount).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an electronically generated receipt.</p>
                            <p>© ${new Date().getFullYear()} Shree Sarwadnya All in one Solutions. All rights reserved.</p>
                        </div>
                        <script>
                            window.onload = function() { window.print(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border/50 bg-card">
                <DialogHeader className="p-6 pb-4 border-b border-border/50 shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Investment Details
                        {investment && (
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                ID: #{investment.reference_id || investment.id}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Track your monthly ROI payouts and upcoming schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : isError ? (
                        <div className="flex-1 flex items-center justify-center p-12 text-destructive">
                            Failed to load schedule. Please try again.
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 p-6 bg-muted/20 shrink-0">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Investment</span>
                                    <div className="text-2xl font-bold font-mono">
                                        ₹{parseFloat(investment?.amount || "0").toLocaleString()}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Progress</span>
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl font-bold text-primary">
                                            {investment?.paid_months} <span className="text-muted-foreground text-sm font-normal">/ {investment?.total_months} Months</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline List */}
                            <ScrollArea className="flex-1 p-6 pt-2">
                                <div className="space-y-6 relative ml-2 mt-2">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-border" />

                                    {schedule.map((installment, index) => {
                                        const isPaid = installment.status === 'Paid';
                                        const isProcessing = installment.status === 'Processing';

                                        return (
                                            <div key={index} className="relative pl-8 group">
                                                {/* Dot */}
                                                <div className={cn(
                                                    "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-colors",
                                                    isPaid ? "border-green-500 text-green-500" :
                                                        isProcessing ? "border-yellow-500 text-yellow-500" :
                                                            "border-muted-foreground text-muted-foreground"
                                                )}>
                                                    {isPaid ? <CheckCircle2 size={14} fill="currentColor" className="text-background" /> :
                                                        isProcessing ? <Clock size={14} /> :
                                                            <Circle size={10} fill="currentColor" className="opacity-0" />}
                                                    {/* Using Empty Circle for unmatured but style it small */}
                                                    {!isPaid && !isProcessing && <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                                                </div>

                                                <div className={cn(
                                                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all",
                                                    isPaid ? "bg-green-500/5 border-green-500/20" :
                                                        isProcessing ? "bg-yellow-500/5 border-yellow-500/20" :
                                                            "bg-card border-border hover:bg-muted/50"
                                                )}>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-sm">Installment #{installment.installment_no}</span>
                                                            <Badge variant={isPaid ? "default" : "secondary"} className={cn(
                                                                "h-5 text-[10px]",
                                                                isPaid ? "bg-green-500 hover:bg-green-600 text-white" :
                                                                    isProcessing ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" : ""
                                                            )}>
                                                                {installment.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(installment.payout_date).toLocaleDateString(undefined, {
                                                                year: 'numeric', month: 'long', day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0 flex items-center gap-4">
                                                        <div className="font-mono font-bold text-lg">
                                                            ₹{parseFloat(installment.amount).toLocaleString()}
                                                        </div>
                                                        {isPaid && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:border-primary/50"
                                                                onClick={() => handlePrintReceipt(installment)}
                                                                title="View Payout Receipt"
                                                            >
                                                                <Printer size={14} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
