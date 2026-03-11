"use client";
import React from 'react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Printer, X, MapPin, Phone, Mail, Globe, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Payout } from '@/lib/types/finance';
import FormattedDate from '@/components/common/FormattedDate';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface PayoutSlipDialogProps {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
}

const PayoutSlipDialog: React.FC<PayoutSlipDialogProps> = ({ isOpen, onClose, payout }) => {
    const { user } = useAuth();
    const [isDownloading, setIsDownloading] = React.useState(false);

    if (!payout) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        const slip = document.getElementById('payout-slip');
        if (!slip) return;

        setIsDownloading(true);
        try {
            // Need to handle transparency and scale for high quality
            const dataUrl = await toPng(slip, {
                quality: 0.95,
                pixelRatio: 2, // High DPI for clear text
                backgroundColor: '#ffffff',
                cacheBust: true,
            });

            const link = document.createElement('a');
            link.download = `payout-slip-${payout.id}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Slip downloaded successfully!");
        } catch (error) {
            console.error('Download failed:', error);
            toast.error("Failed to download slip");
        } finally {
            setIsDownloading(false);
        }
    };

    // Calculate details
    const grossAmount = Number(payout.amount);
    const tds = Number(payout.tds || 0);
    const adminCharges = Number(payout.admin_charges || 0);
    const netAmount = Number(payout.net_amount || (grossAmount - tds - adminCharges));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 bg-white overflow-hidden border-none rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                {/* Non-printing Control Bar */}
                <div className="bg-slate-100 p-4 flex justify-between items-center border-b sticky top-0 z-50 print:hidden">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
                        <Printer className="w-4 h-4" />
                        Payout Slip Preview
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            DOWNLOAD
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handlePrint}
                            className="bg-primary hover:bg-primary/90 text-white border-none font-bold text-xs"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            PRINT SLIP
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* SLIP CONTENT STARTS HERE */}
                <div id="payout-slip" className="p-4 md:p-12 text-black bg-white min-h-[600px] relative overflow-hidden">
                    {/* Premium Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-12">
                        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
                            <Image
                                src="/sarwadnya-nav-logo.png"
                                alt="Watermark"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 border-b-2 border-slate-200 pb-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 bg-white p-2 border border-slate-100 rounded-xl shadow-sm">
                                <Image
                                    src="/sarwadnya-nav-logo.png"
                                    alt="Sarwadnya Finance"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black text-[#B8860B] italic tracking-tight uppercase leading-tight">
                                    Sarwadnya Finance
                                </h1>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Grow With Success</p>
                            </div>
                        </div>

                        <div className="text-center md:text-right space-y-1 md:space-y-1.5 max-w-sm">
                            <p className="text-[10px] font-medium text-slate-700 flex items-center justify-center md:justify-end gap-2">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                Sr No. 85/2c, Office No. 301, 302, 3rd Floor, Parakh Capital, Hadapsar, Pune - 411028
                            </p>
                            <div className="flex flex-col md:flex-row items-center md:justify-end gap-1 md:gap-3">
                                <p className="text-[10px] font-medium text-slate-700 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-primary" />
                                    +91 9172956383
                                </p>
                                <p className="text-[10px] font-medium text-slate-700 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-primary" />
                                    info@sarwadnyafinance.com
                                </p>
                            </div>
                            <p className="text-[10px] font-medium text-slate-700 flex items-center justify-center md:justify-end gap-2">
                                <Globe className="w-3 h-3 text-primary" />
                                www.sarwadnyafinance.com
                            </p>
                        </div>
                    </div>

                    {/* Slip Type Heading */}
                    <div className="py-6 text-center">
                        <div className="inline-block bg-slate-900 px-6 md:px-10 py-2 rounded-full shadow-lg">
                            <h2 className="text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                                {payout.type === 'roi' ? 'Self Bonus Payslip' : 'Level Bonus Payslip'}
                            </h2>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm relative z-10">
                        {/* Member Details */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-200">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Member Details</h4>
                            </div>
                            <div className="p-4 space-y-3">
                                <DetailRow label="Name" value={user?.name || payout.user?.name || '---'} />
                                <DetailRow label="User Name" value={`ID: ${user?.id || payout.user?.id || '---'}`} />
                                <DetailRow label="Phone No." value={user?.phone_number || payout.user?.phone_number || '---'} />
                                <DetailRow label="Email" value={user?.email || payout.user?.email || '---'} />
                                <DetailRow label="City" value="Pune, MH" />
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div>
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Payment Details</h4>
                            </div>
                            <div className="p-4 space-y-3">
                                <DetailRow label="Payout No." value={`#${payout.id}`} align="right" />
                                <DetailRow label="Issued On" value={<FormattedDate date={payout.created_at} />} align="right" />
                                <DetailRow label="Payout Date" value={<FormattedDate date={payout.payout_date} />} align="right" />
                                <DetailRow label="Status" value={payout.status || 'Paid'} align="right" />
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-md relative z-10">
                        <div className="bg-slate-900 px-4 py-2.5 flex justify-between items-center">
                            <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Bonus Calculation Details</h4>
                            <span className="text-primary text-[8px] font-bold">ALL AMOUNTS IN INR (₹)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 bg-white">
                            {/* Earnings Column */}
                            <div className="border-b md:border-b-0 md:border-r border-slate-200">
                                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200">
                                    <div className="px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase">Earning Head</div>
                                    <div className="px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase text-right">Points/Amt</div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <AmountRow label="Principal Earnings" amount={payout.type === 'roi' ? grossAmount : 0} />
                                    {/* <AmountRow label="Level Income" amount={payout.type === 'referral' ? grossAmount : 0} /> */}
                                    {/* <AmountRow label="Referral Bonus" amount={0} /> */}
                                    <div className="grid grid-cols-2 px-4 py-3 bg-slate-50/50">
                                        <div className="text-[11px] font-black text-slate-900 uppercase">Total Earning</div>
                                        <div className="text-[11px] font-black text-slate-900 text-right">₹{grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Column */}
                            <div>
                                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200">
                                    <div className="px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase">Deductions</div>
                                    <div className="px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase text-right">Points/Amt</div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <AmountRow label="TDS Deduction (5%)" amount={tds} isDeduction />
                                    <AmountRow label="Admin Charges" amount={adminCharges} isDeduction />
                                    <AmountRow label="Service Fee" amount={0} isDeduction />
                                    <div className="grid grid-cols-2 px-4 py-3 bg-slate-50/50">
                                        <div className="text-[11px] font-black text-slate-900 uppercase">Total Deduction</div>
                                        <div className="text-[11px] font-black text-red-600 text-right">₹{(tds + adminCharges).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Net Amount Section */}
                    <div className="bg-[#B8860B] rounded-2xl p-6 text-white flex flex-col items-center justify-center relative z-10 overflow-hidden shadow-xl mt-10 group">
                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-80">Net Amount Payable</h3>
                        <div className="text-3xl md:text-5xl font-black italic tracking-tighter drop-shadow-lg flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl not-italic font-bold opacity-60">₹</span>
                            {netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[9px] font-bold mt-2 opacity-80 uppercase tracking-widest px-4 py-1 border border-white/20 rounded-full">Final Settlement Amount</p>
                    </div>

                    {/* Footer Auth Section */}
                    <div className="mt-12 pt-8 border-t border-dashed border-slate-300 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="flex flex-col items-center">
                            <div className="w-40 h-10 border-b border-slate-900 mb-2 font-serif text-slate-300 flex items-end justify-center text-[10px] italic">Verified Digital Document</div>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Authorized Officer</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 italic text-center md:text-right max-w-[280px] leading-relaxed">
                            Note: This is an automatically generated system document. No physical signature is required for verification. Generated via Sarwadnya Finance ERP.
                        </div>
                    </div>
                </div>
            </DialogContent>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #payout-slip, #payout-slip * {
                        visibility: visible;
                    }
                    #payout-slip {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 40px !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        z-index: 9999;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </Dialog>
    );
};

// Internal Helper Components
const DetailRow = ({ label, value, align = 'left' }: { label: string, value: React.ReactNode, align?: 'left' | 'right' }) => (
    <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</span>
        <span className="text-xs font-bold text-slate-800 leading-tight">{value}</span>
    </div>
);

const AmountRow = ({ label, amount, isDeduction = false }: { label: string, amount: number, isDeduction?: boolean }) => (
    <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50 transition-colors">
        <div className="text-[10px] font-medium text-slate-600">{label}</div>
        <div className={`text-[10px] font-bold text-right ${isDeduction && amount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
    </div>
);

export default PayoutSlipDialog;
