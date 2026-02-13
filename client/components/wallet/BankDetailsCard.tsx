import React from 'react';
import { useGetPaymentDetailsQuery } from '@/redux/apies/paymentApi';
import { Copy, CreditCard, CheckCircle2, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BankDetailsCard() {
    const { data: bankData, isLoading } = useGetPaymentDetailsQuery();

    // Handle both array (new) and single object (old, just in case) response structures
    const banks = Array.isArray(bankData?.data)
        ? bankData.data
        : (bankData?.data ? [bankData.data] : []);

    // Filter/Sort to show primary first
    const sortedBanks = [...banks].sort((a: any, b: any) => {
        const aPrimary = (a.is_primary === 1 || a.is_primary === true);
        const bPrimary = (b.is_primary === 1 || b.is_primary === true);
        return bPrimary === aPrimary ? 0 : aPrimary ? -1 : 1;
    });

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    if (isLoading) {
        return (
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm space-y-4 animate-pulse">
                <div className="h-6 w-1/3 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
            </div>
        );
    }

    if (sortedBanks.length === 0) {
        return null; // Don't show if no banks
    }

    // We can show just the primary one expanded, and others collapsed or just list all.
    // For now, listing all but highlighting primary.
    const primaryBank = sortedBanks[0]; // First one is primary due to sort

    return (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Building2 size={18} className="text-primary" />
                    Bank Details
                </h3>
                <span className="text-xs text-muted-foreground">For Deposits</span>
            </div>

            <div className="p-0">
                {sortedBanks.map((bank: any, index: number) => {
                    const isPrimary = (bank.is_primary === 1 || bank.is_primary === true);
                    return (
                        <div key={bank.id || index} className={`p-4 ${index !== sortedBanks.length - 1 ? 'border-b border-border/50' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 text-center">
                                    {bank.receipt_image ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border mb-1 cursor-pointer" onClick={() => window.open(typeof bank.receipt_image === 'string' && bank.receipt_image.startsWith('http') ? bank.receipt_image : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${bank.receipt_image}`, '_blank')}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={typeof bank.receipt_image === 'string' && bank.receipt_image.startsWith('http') ? bank.receipt_image : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${bank.receipt_image}`}
                                                alt="QR"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-1">
                                            <CreditCard size={24} />
                                        </div>
                                    )}
                                    {isPrimary && (
                                        <span className="text-[10px] font-bold uppercase text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                                            Primary
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm truncate" title={bank.bank_name}>{bank.bank_name}</h4>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded text-xs group">
                                            <span className="text-muted-foreground mr-2">Acc No:</span>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="font-mono font-medium truncate">{bank.account_number}</span>
                                                <button onClick={() => copyToClipboard(bank.account_number, "Account Number")} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded text-xs group">
                                            <span className="text-muted-foreground mr-2">IFSC:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-medium uppercase">{bank.ifsc_code}</span>
                                                <button onClick={() => copyToClipboard(bank.ifsc_code, "IFSC Code")} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                            <User size={12} />
                                            <span className="truncate" title={bank.account_holder_name}>{bank.account_holder_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
