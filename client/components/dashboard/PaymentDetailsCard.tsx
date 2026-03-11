"use client";
import React from 'react';
import { Building2, Copy, AlertCircle, Loader2, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BankDetails {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    usdt_network?: string;
    usdt_address?: string;
    qr_code?: string;
    receipt_image?: string;
}

interface PaymentDetailsCardProps {
    selectedMethod: string;
    isLoading: boolean;
    paymentDetails: BankDetails | null;
    onPreviewImage: (url: string, title: string) => void;
}

const PaymentDetailsCard = ({ selectedMethod, isLoading, paymentDetails, onPreviewImage }: PaymentDetailsCardProps) => {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`, { icon: '📋' });
    };

    if (selectedMethod !== "Bank Transfer" && selectedMethod !== "USDT Deposit") return null;

    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-linear-to-br from-background to-muted border border-primary/20 rounded-2xl p-0.5 shadow-lg overflow-hidden group hover:shadow-primary/5 transition-all">
                <div className="bg-card rounded-[15px] p-5 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2 relative z-10">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 size={16} />}
                        {selectedMethod === "Bank Transfer" ? "Bank Details" : "Wallet Details"}
                    </h3>

                    {isLoading ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-10 bg-muted rounded-lg w-full"></div>
                            <div className="h-10 bg-muted rounded-lg w-full"></div>
                            <div className="h-10 bg-muted rounded-lg w-full"></div>
                        </div>
                    ) : paymentDetails ? (
                        selectedMethod === "Bank Transfer" ? (
                            <div className="space-y-4 text-sm relative z-10">
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Bank Name</p>
                                    <p className="font-bold text-foreground">{paymentDetails.bank_name}</p>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Account Holder</p>
                                    <p className="font-bold text-foreground">{paymentDetails.account_holder_name}</p>
                                </div>
                                <div
                                    className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex justify-between items-center group/copy cursor-pointer hover:bg-primary/10 transition-colors"
                                    onClick={() => copyToClipboard(paymentDetails.account_number || "", "Account Number")}
                                >
                                    <div>
                                        <p className="text-[10px] text-primary/70 uppercase tracking-widest mb-1">Account Number</p>
                                        <p className="font-mono font-bold tracking-wide text-primary text-lg">{paymentDetails.account_number}</p>
                                    </div>
                                    <Copy size={16} className="text-primary opacity-50 group-hover/copy:opacity-100 transition-opacity" />
                                </div>
                                <div
                                    className="bg-muted/30 p-3 rounded-lg border border-border/50 flex justify-between items-center group/copy cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => copyToClipboard(paymentDetails.ifsc_code || "", "IFSC Code")}
                                >
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">IFSC Code</p>
                                        <p className="font-mono font-bold tracking-wide">{paymentDetails.ifsc_code}</p>
                                    </div>
                                    <Copy size={14} className="opacity-50 group-hover/copy:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-sm relative z-10">
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Network</p>
                                    <p className="font-bold text-foreground">{paymentDetails.usdt_network}</p>
                                </div>
                                <div
                                    className="bg-primary/5 p-4 rounded-lg border border-primary/10 group/copy cursor-pointer hover:bg-primary/10 transition-colors"
                                    onClick={() => copyToClipboard(paymentDetails.usdt_address || "", "Wallet Address")}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] text-primary/70 uppercase tracking-widest">USDT Address</p>
                                        <Copy size={14} className="text-primary opacity-50 group-hover/copy:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="font-mono text-xs break-all leading-relaxed text-primary font-medium">{paymentDetails.usdt_address}</p>
                                </div>
                                {(paymentDetails.qr_code || paymentDetails.receipt_image) && (
                                    <div className="mt-4 flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-border/50">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Scan QR Code</p>
                                        <div className="w-48 h-48 bg-white rounded-lg p-1">
                                            {(() => {
                                                const qrSrc = paymentDetails.qr_code || paymentDetails.receipt_image || "";
                                                const fullSrc = qrSrc.startsWith('http') ? qrSrc : `${process.env.NEXT_PUBLIC_BACKEND_URL}${qrSrc.startsWith('/') ? '' : '/storage/'}${qrSrc}`;
                                                return (
                                                    <div
                                                        className="relative group cursor-zoom-in w-full h-full"
                                                        onClick={() => onPreviewImage(fullSrc, 'USDT Payment QR')}
                                                    >
                                                        <img src={fullSrc} alt="USDT QR Code" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                            <Maximize2 className="text-primary w-6 h-6" />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg text-xs leading-relaxed flex gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>Only send USDT ({paymentDetails.usdt_network}). Sending other assets may result in permanent loss.</span>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-sm text-red-500">Failed to load details. Please try again.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PaymentDetailsCard);
