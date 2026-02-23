"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Loader2, Save, Landmark, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useGetUserQuery, useUpdateUserMutation } from "@/redux/apies/usersCrudApi";
import { useGetAdminUserBankDetailsQuery, useUpdateUserBankDetailsMutation } from "@/redux/apies/adminApi";
import type { AdminUser, BankDetail, BankDetailRequest } from "@/lib/types";
import { toast } from "react-hot-toast";

function BankDetailForm({ bankItem, refetchBank }: { bankItem: BankDetail, refetchBank: () => void }) {
    const [updateUserBankDetails, { isLoading: isUpdatingBank }] = useUpdateUserBankDetailsMutation();
    const bankForm = useForm<BankFormValues>({
        resolver: zodResolver(bankSchema),
        defaultValues: {
            bank_name: bankItem.bank_name,
            account_holder_name: bankItem.account_holder_name,
            account_number: bankItem.account_number,
            ifsc_code: bankItem.ifsc_code,
            branch_name: bankItem.branch_name || '',
            is_primary: Boolean(bankItem.is_primary),
        }
    });

    useEffect(() => {
        bankForm.reset({
            bank_name: bankItem.bank_name,
            account_holder_name: bankItem.account_holder_name,
            account_number: bankItem.account_number,
            ifsc_code: bankItem.ifsc_code,
            branch_name: bankItem.branch_name || '',
            is_primary: Boolean(bankItem.is_primary),
        });
    }, [bankItem, bankForm.reset]);

    const onBankSubmit = async (data: BankFormValues) => {
        try {
            await updateUserBankDetails({ id: bankItem.id, data: data as BankDetailRequest }).unwrap();
            refetchBank();
            toast.success("Bank details updated successfully!");
        } catch (error: any) {
            console.error("Failed to update bank details", error);
            toast.error("Failed to update bank details.");
        }
    };

    return (
        <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 mb-4 gap-2">
                <h4 className="font-semibold">{bankItem.bank_name} - {bankItem.account_number.slice(-4)}</h4>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Primary Account</label>
                    <Controller
                        control={bankForm.control}
                        name="is_primary"
                        render={({ field }) => (
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Name</label>
                    <input
                        {...bankForm.register("bank_name")}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {bankForm.formState.errors.bank_name && <p className="text-red-500 text-xs">{bankForm.formState.errors.bank_name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Account Holder</label>
                    <input
                        {...bankForm.register("account_holder_name")}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {bankForm.formState.errors.account_holder_name && <p className="text-red-500 text-xs">{bankForm.formState.errors.account_holder_name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Account Number</label>
                    <input
                        {...bankForm.register("account_number")}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {bankForm.formState.errors.account_number && <p className="text-red-500 text-xs">{bankForm.formState.errors.account_number.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">IFSC Code</label>
                    <input
                        {...bankForm.register("ifsc_code")}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {bankForm.formState.errors.ifsc_code && <p className="text-red-500 text-xs">{bankForm.formState.errors.ifsc_code.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Branch Name</label>
                    <input
                        {...bankForm.register("branch_name")}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    disabled={isUpdatingBank}
                    onClick={bankForm.handleSubmit(onBankSubmit)}
                    className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-all flex items-center gap-2"
                >
                    {isUpdatingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Details
                </button>
            </div>
        </div>
    );
}

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    referral_code: z.string().optional(),
    company_support: z.boolean().optional(),
});

const bankSchema = z.object({
    bank_name: z.string().min(2, "Bank name is required"),
    account_holder_name: z.string().min(2, "Account holder name is required"),
    account_number: z.string().min(5, "Account number is required"),
    ifsc_code: z.string().min(4, "IFSC code is required"),
    branch_name: z.string().optional(),
    is_primary: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;
type BankFormValues = z.infer<typeof bankSchema>;

function EditUserContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = Number(searchParams.get("id"));

    // API Hooks
    const { data: userData, isLoading: isFetchingUser } = useGetUserQuery(id, {
        skip: !id,
    });
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    // Bank Details Logic
    const [isBankSectionOpen, setIsBankSectionOpen] = useState(false);
    const { data: bankData, isLoading: isFetchingBank, refetch: refetchBank } = useGetAdminUserBankDetailsQuery(id, { skip: !id });
    const rawBankData = bankData?.data as any;
    const bankList = (Array.isArray(rawBankData) ? rawBankData : (rawBankData ? [rawBankData] : [])) as BankDetail[];

    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

    // Auth check
    useEffect(() => {
        if (typeof window !== "undefined") {
            const adminUserStr = localStorage.getItem("adminUser");
            if (adminUserStr) {
                try {
                    setAdminUser(JSON.parse(adminUserStr));
                } catch (error) {
                    console.error("Error parsing admin user data:", error);
                }
            }
        }
    }, [router]);

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
    });

    // Populate form
    useEffect(() => {
        if (userData) {
            reset({
                name: userData.name,
                email: userData.email,
                phone_number: userData.phone_number,
                referral_code: userData.referral_code,
                company_support: userData.company_support || false,
            });
        }
    }, [userData, reset]);

    const onSubmit = async (data: UserFormValues) => {
        if (!id) return;
        const { referral_code, ...updateData } = data;
        try {
            await updateUser({ id, data: updateData }).unwrap();
            router.push("/admin/dashboard/users");
        } catch (error: any) {
            console.error("Failed to update user", error);
        }
    };

    if (!adminUser) return null;

    if (isFetchingUser) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/users">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit User</h1>
                    <p className="text-muted-foreground text-sm">Update user details.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                {...register("name")}
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <input
                                {...register("phone_number")}
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="+1234567890"
                            />
                            {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Referral Code</label>
                            <input
                                {...register("referral_code")}
                                disabled
                                className="w-full bg-muted/20 border border-border rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">Automatically assigned unique code.</p>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Company Support</label>
                                    <p className="text-xs text-muted-foreground">
                                        Enable company support for this user (stops automated ROI payouts).
                                    </p>
                                </div>
                                <Controller
                                    control={control}
                                    name="company_support"
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="border-t border-border pt-6">
                        <button
                            type="button"
                            onClick={() => setIsBankSectionOpen(!isBankSectionOpen)}
                            className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Landmark className="w-5 h-5 text-primary" />
                                <span className="font-semibold">Bank Details</span>
                            </div>
                            {isBankSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isBankSectionOpen && (
                            <div className="mt-4 p-4 border border-border rounded-xl animate-in fade-in slide-in-from-top-2">
                                {isFetchingBank ? (
                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                                ) : bankList.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground">No bank details found for this user.</div>
                                ) : (
                                    <div className="space-y-6">
                                        {bankList.map((bankItem) => (
                                            <BankDetailForm key={bankItem.id} bankItem={bankItem} refetchBank={refetchBank} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/admin/dashboard/users">
                            <button type="button" className="px-4 py-2 hover:bg-muted rounded-lg text-sm font-medium transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Update User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EditUserClient() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <EditUserContent />
        </Suspense>
    );
}
