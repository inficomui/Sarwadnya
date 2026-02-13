import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useGetInvestmentScheduleQuery, useGetAdminInvestmentScheduleQuery } from "@/redux/apies/investmentApi";
import { Loader2, Calendar, AlertCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface InvestmentScheduleModalProps {
    investmentId: number | null;
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

export default function InvestmentScheduleModal({
    investmentId,
    isOpen,
    onClose,
    isAdmin = false
}: InvestmentScheduleModalProps) {
    // User Query
    const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
        error: userError
    } = useGetInvestmentScheduleQuery(investmentId ?? 0, {
        skip: !isOpen || !investmentId || isAdmin,
    });

    // Admin Query
    const {
        data: adminData,
        isLoading: isAdminLoading,
        isError: isAdminError,
        error: adminError
    } = useGetAdminInvestmentScheduleQuery(investmentId ?? 0, {
        skip: !isOpen || !investmentId || !isAdmin,
    });

    // Determine which data to use
    const data = isAdmin ? adminData : userData;
    const isLoading = isAdmin ? isAdminLoading : isUserLoading;
    const isError = isAdmin ? isAdminError : isUserError;
    const error = isAdmin ? adminError : userError;

    const investment = data?.data?.investment;
    const schedule = data?.data?.schedule || [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>ROI Payout Schedule</DialogTitle>
                    <DialogDescription>
                        Track the monthly ROI payouts for this investment.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Loading schedule...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-destructive">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p className="font-medium">Failed to load schedule</p>
                            {/* @ts-ignore */}
                            {error?.data?.message && (
                                /* @ts-ignore */
                                <p className="text-xs mt-2 text-center max-w-md">{error.data.message}</p>
                            )}
                        </div>
                    ) : !investment ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No details available for this investment.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Investment Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground">Amount</p>
                                    <p className="font-semibold text-foreground">
                                        ₹{parseFloat(investment.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">ROI Rate</p>
                                    <p className="font-semibold text-green-600">
                                        {investment.roi_percentage || 10}% / Month
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="font-semibold text-foreground">
                                        {investment.duration_months || 20} Months
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Expected</p>
                                    <p className="font-semibold text-primary">
                                        ₹{((parseFloat(investment.amount) * (investment.roi_percentage || 10) / 100) * (investment.duration_months || 20)).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            {/* Schedule List */}
                            <div className="rounded-md border">
                                <div className="grid grid-cols-4 p-3 bg-muted font-medium text-sm text-muted-foreground">
                                    <div>#</div>
                                    <div>Date</div>
                                    <div>Amount</div>
                                    <div className="text-right">Status</div>
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <div className="divide-y divide-border">
                                        {schedule.length > 0 ? (
                                            schedule.map((item, index) => (
                                                <div
                                                    key={item.id || index}
                                                    className="grid grid-cols-4 p-3 text-sm items-center hover:bg-muted/30"
                                                >
                                                    <div className="text-muted-foreground">
                                                        {item.installment_no}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        {new Date(item.payout_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="font-medium">
                                                        ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant={
                                                                item.status === 'Paid' ? 'default' :
                                                                    item.status === 'Processing' ? 'secondary' : 'outline'
                                                            }
                                                            className={`
                                                                ${item.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : ''}
                                                                ${item.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' : ''}
                                                                ${item.status === 'Unmatured' ? 'text-muted-foreground border-border' : ''}
                                                            `}
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground">
                                                No schedule items found.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
