"use client";

import React from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, CreditCard, ArrowLeft } from "lucide-react";
import { useGetAdminBankDetailsQuery, useDeleteAdminBankDetailMutation } from "@/redux/apies/paymentApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function BankDetailsListPage() {
    const router = useRouter();
    const { adminUser } = useAdminAuth();
    // Using getAdminBankDetails to fetch the list of banks
    const { data: paymentData, isLoading } = useGetAdminBankDetailsQuery(adminUser?.id as number, {
        skip: !adminUser?.id,
    });
    const [deleteBank, { isLoading: isDeleting }] = useDeleteAdminBankDetailMutation();

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this bank account?")) {
            try {
                await deleteBank(id).unwrap();
                toast.success("Bank account deleted successfully");
            } catch (error) {
                console.error("Failed to delete bank", error);
                toast.error("Failed to delete bank account");
            }
        }
    };

    // Ensure we handle both array or if API returns specific structure
    const banks = Array.isArray(paymentData?.data) ? paymentData.data : (paymentData?.data ? [paymentData.data] : []);

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Link href="/admin/dashboard/settings" className="hover:text-primary transition-colors flex items-center gap-1">
                            <ArrowLeft size={16} /> Back to Settings
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold">Bank Accounts</h1>
                    <p className="text-sm text-muted-foreground">Manage the bank accounts where users can deposit funds.</p>
                </div>
                <Link href="/admin/dashboard/settings/banks/add">
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:brightness-110 transition-all shadow-md">
                        <Plus size={18} /> Add New Bank
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        LOADING...
                    </div>
                ) : banks.length > 0 ? (
                    banks.map((bank: any, index: number) => (
                        <div key={bank.id || index} className="bg-card border border-border rounded-xl p-6 shadow-sm relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity z-10">
                                <Link href={`/admin/dashboard/settings/banks/edit?id=${bank.id}`}>
                                    <button className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm">
                                        <Edit size={16} />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(bank.id || 0)}
                                    className="p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-white transition-colors shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-0">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3 overflow-hidden">
                                        {(() => {
                                            const imgPath = bank.qr_code || bank.receipt_image;
                                            if (imgPath) {
                                                const fullSrc = typeof imgPath === 'string' && imgPath.startsWith('http')
                                                    ? imgPath
                                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${imgPath.startsWith('/') ? '' : '/storage/'}${imgPath}`;
                                                return (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={fullSrc} alt="QR" className="w-full h-full object-cover" />
                                                );
                                            }
                                            return <CreditCard size={24} />;
                                        })()}
                                    </div>
                                    {(bank.is_primary == 1 || bank.is_primary === true) && (
                                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                                            Primary
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg line-clamp-1" title={bank.bank_name}>{bank.bank_name || "Unknown Bank"}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{bank.account_holder_name}</p>
                            </div>

                            <div className="space-y-2 text-sm bg-muted/30 p-3 rounded-lg">
                                <div className="flex justify-between border-b border-border/50 pb-2">
                                    <span className="text-muted-foreground">Account No:</span>
                                    <span className="font-mono font-medium">{bank.account_number}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/50 pb-2">
                                    <span className="text-muted-foreground">IFSC Code:</span>
                                    <span className="font-mono font-medium">{bank.ifsc_code}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-muted-foreground">Network:</span>
                                    <span className="font-medium">{bank.usdt_network || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-card border border-border rounded-xl border-dashed">
                        <CreditCard size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">No bank accounts found</h3>
                        <p className="text-sm text-muted-foreground/70 mb-6">Add a bank account to start accepting deposits.</p>
                        <Link href="/admin/dashboard/settings/banks/add">
                            <button className="text-primary hover:underline font-medium">Add First Bank Account</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
