"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, IndianRupee, Upload, X, Image as ImageIcon } from "lucide-react";
import { useAddAdminBankDetailMutation } from "@/redux/apies/paymentApi";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Schema Validation
const bankSchema = z.object({
    bank_name: z.string().min(2, "Bank Name is required"),
    account_number: z.string().min(5, "Account Number is required"),
    ifsc_code: z.string().min(4, "IFSC Code is required"),
    account_holder_name: z.string().min(2, "Account Holder Name is required"),
    usdt_address: z.string().optional(),
    usdt_network: z.string().optional(),
    is_primary: z.boolean().optional(),
    // qr_code: z.any().optional(), // Handled separately or specifically
});

type BankFormValues = z.infer<typeof bankSchema>;

export default function AddBankPage() {
    const router = useRouter();
    const [addBank, { isLoading: isAdding }] = useAddAdminBankDetailMutation();
    const { adminUser } = useAdminAuth();

    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [qrFile, setQrFile] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<BankFormValues>({
        resolver: zodResolver(bankSchema),
        defaultValues: {
            usdt_network: "TRC20",
            is_primary: false,
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setQrFile(null);
        setQrPreview(null);
    };

    const onSubmit = async (data: BankFormValues) => {
        try {
            const formData = new FormData();
            formData.append("bank_name", data.bank_name);
            formData.append("account_number", data.account_number);
            formData.append("ifsc_code", data.ifsc_code);
            formData.append("account_holder_name", data.account_holder_name);
            if (data.usdt_address) formData.append("usdt_address", data.usdt_address);
            if (data.usdt_network) formData.append("usdt_network", data.usdt_network);
            formData.append("is_primary", data.is_primary ? "1" : "0");

            if (qrFile) {
                formData.append("receipt_image", qrFile);
            }

            if (adminUser?.id) {
                await addBank({ userId: adminUser.id, data: formData }).unwrap();
                toast.success("Bank account added successfully!");
                router.push("/admin/dashboard/settings/banks");
            } else {
                toast.error("Admin user not found. Please login again.");
            }
        } catch (error: any) {
            console.error("Failed to add bank:", error);
            toast.error(error?.data?.message || "Failed to add bank account");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/settings/banks" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Add New Bank</h1>
                    <p className="text-muted-foreground text-sm">Add a new bank account for accepting deposits.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <IndianRupee size={20} />
                            </div>
                            <h3 className="font-semibold">Bank Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bank Name <span className="text-red-500">*</span></label>
                                <input
                                    {...register("bank_name")}
                                    placeholder="e.g. State Bank of India"
                                    className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                                {errors.bank_name && <p className="text-red-500 text-xs mt-1">{errors.bank_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Account Holder Name <span className="text-red-500">*</span></label>
                                <input
                                    {...register("account_holder_name")}
                                    placeholder="Shree Sarwadnya All in one Solutions"
                                    className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                                {errors.account_holder_name && <p className="text-red-500 text-xs mt-1">{errors.account_holder_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Account Number <span className="text-red-500">*</span></label>
                                <input
                                    {...register("account_number")}
                                    placeholder="e.g. 1234567890"
                                    className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                />
                                {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">IFSC Code <span className="text-red-500">*</span></label>
                                <input
                                    {...register("ifsc_code")}
                                    placeholder="e.g. SBIN0001234"
                                    className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase font-mono"
                                />
                                {errors.ifsc_code && <p className="text-red-500 text-xs mt-1">{errors.ifsc_code.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Additional Details (Optional)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">USDT Address</label>
                                <input
                                    {...register("usdt_address")}
                                    placeholder="USDT TRC20 Address"
                                    className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Network</label>
                                <input
                                    {...register("usdt_network")}
                                    placeholder="e.g. TRC20"
                                    className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Image Upload for QR Code */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">QR Code Image</label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/60 px-6 py-10 bg-muted/20 hover:bg-muted/40 transition-colors">
                                <div className="text-center">
                                    {qrPreview ? (
                                        <div className="relative inline-block">
                                            <img src={qrPreview} alt="QR Preview" className="max-h-48 rounded-lg shadow-md" />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full hover:scale-110 transition-transform shadow-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                                            <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 hover:text-primary/80"
                                                >
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs leading-5 text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_primary"
                                {...register("is_primary")}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_primary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Set as Primary Bank Account
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">Primary bank account will be displayed first to users.</p>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Link href="/admin/dashboard/settings/banks">
                            <button
                                type="button"
                                className="px-6 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                        >
                            {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Bank Details
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
