"use client";
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { userSidebarItems } from '@/lib/userSidebarItems';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/redux/apies/authApi';
import {
    useGetBankDetailsQuery,
    useAddBankDetailMutation,
} from '@/redux/apies/paymentApi';
import {
    Plus,
    Trash2,
    MoreVertical,
    User,
    Shield,
    Landmark,
    Phone,
    Lock,
    Mail,
    Edit,
    X,
    Save,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import Loader from '@/components/common/Loader';
import RefreshButton from "@/components/common/RefreshButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { BankDetail } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Schema for Profile Details
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
});

// Schema for Password Update
const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});

// Schema for Bank Details
const bankSchema = z.object({
    bank_name: z.string().min(2, "Bank name is required"),
    account_holder_name: z.string().min(2, "Account holder name is required"),
    account_number: z.string().min(5, "Account number is required"),
    ifsc_code: z.string().min(4, "IFSC code is required"),
    branch_name: z.string().optional(),
    is_primary: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type BankFormValues = z.infer<typeof bankSchema>;

export default function ProfilePage() {
    const { user, logout, isLoggingOut } = useAuth();
    const { data: profileData, isLoading: isProfileLoading, refetch, isFetching } = useGetUserProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

    // Bank API Hooks
    const { data: bankData, isLoading: isBankLoading, refetch: refetchBanks } = useGetBankDetailsQuery();

    const [addBankDetail, { isLoading: isAddingBank }] = useAddBankDetailMutation();

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPasswordEditMode, setIsPasswordEditMode] = useState(false);
    const [isAddBankOpen, setIsAddBankOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'security' | 'bank'>('details');

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            email: '',
            phone_number: '',
        }
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: ''
        }
    });

    const bankForm = useForm<BankFormValues>({
        resolver: zodResolver(bankSchema),
        defaultValues: {
            bank_name: '',
            account_holder_name: '',
            account_number: '',
            ifsc_code: '',
            branch_name: '',
            is_primary: false,
        }
    });

    const onBankSubmit = async (data: BankFormValues) => {
        try {
            await addBankDetail(data).unwrap();
            toast.success("Bank account added successfully!");
            setIsAddBankOpen(false);
            bankForm.reset();
            refetchBanks();
        } catch (error: any) {
            console.error("Add bank error:", error);
            toast.error(error?.data?.message || "Failed to add bank account");
        }
    };



    // Populate form when data loads
    useEffect(() => {
        if (profileData) {
            profileForm.reset({
                name: profileData.name || '',
                email: profileData.email || '',
                phone_number: profileData.phone_number || '',
            });
        }
    }, [profileData, profileForm]);



    const onProfileSubmit = async (data: ProfileFormValues) => {
        try {
            await updateProfile(data as any).unwrap();
            toast.success("Profile updated successfully!");
            setIsEditMode(false);
            refetch();
        } catch (error: any) {
            console.error("Profile update error:", error);
            const msg = error?.data?.message || "Failed to update profile";
            toast.error(msg);

            if (msg.includes("email")) {
                profileForm.setError("email", { message: msg });
            }
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            await updateProfile({
                current_password: data.current_password,
                password: data.password,
                password_confirmation: data.password_confirmation
            } as any).unwrap();

            toast.success("Password updated successfully!");
            passwordForm.reset();
            setIsPasswordEditMode(false);
        } catch (error: any) {
            console.error("Password update error:", error);
            const errorMsg = error?.data?.message || "Failed to update password";

            // Check if error is related to current password
            if (errorMsg.toLowerCase().includes("current password")) {
                passwordForm.setError("current_password", { message: errorMsg });
            }

            toast.error(errorMsg);
        }
    };



    const handleCancelEdit = () => {
        setIsEditMode(false);
        profileForm.reset({
            name: profileData?.name || '',
            email: profileData?.email || '',
            phone_number: profileData?.phone_number || '',
        });
    };

    const handleCancelPasswordEdit = () => {
        setIsPasswordEditMode(false);
        passwordForm.reset();
    };



    return (
        <>
            <div className="space-y-8 max-w-5xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your personal information, security, and banking details.</p>
                    </div>
                    <RefreshButton
                        onRefresh={() => { refetch(); refetchBanks(); }}
                        isRefreshing={isFetching}
                        label="Refresh"
                    />
                </div>

                {isProfileLoading ? (
                    <Loader center text="Loading your profile..." className="min-h-[400px]" />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar / Tabs */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Profile Summary Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-primary/20 to-purple-500/20"></div>
                                <div className="relative mt-4 mb-4">
                                    <div className="w-24 h-24 bg-background rounded-full p-1 shadow-xl">
                                        <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {profileData?.name?.charAt(0).toUpperCase() || <User />}
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{profileData?.name}</h2>
                                <p className="text-sm text-muted-foreground mb-4">{profileData?.email}</p>

                                <div className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                    <Shield size={12} />
                                    <span>Verified Account</span>
                                </div>
                            </motion.div>

                            {/* Navigation Tabs */}
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200 border-l-4 ${activeTab === 'details'
                                        ? 'bg-primary/5 border-primary text-primary font-medium'
                                        : 'border-transparent hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                >
                                    <User size={18} />
                                    <span>Personal Information</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('bank')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200 border-l-4 ${activeTab === 'bank'
                                        ? 'bg-primary/5 border-primary text-primary font-medium'
                                        : 'border-transparent hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                >
                                    <Landmark size={18} />
                                    <span>Bank Details</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
                            >
                                {activeTab === 'details' && (
                                    <div className="space-y-6">
                                        <div className="border-b border-border pb-4 mb-6">
                                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                                <User className="text-primary" size={24} />
                                                Personal Information
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {isEditMode ? 'Update your personal details here.' : 'View your personal details.'}
                                            </p>
                                        </div>

                                        {!isEditMode ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                                            <User className="text-muted-foreground" size={18} />
                                                            <span className="text-foreground font-medium">{profileData?.name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                                            <Phone className="text-muted-foreground" size={18} />
                                                            <span className="text-foreground font-medium">{profileData?.phone_number}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                                            <Mail className="text-muted-foreground" size={18} />
                                                            <span className="text-foreground font-medium">{profileData?.email}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 flex justify-end">
                                                    <Button
                                                        onClick={() => setIsEditMode(true)}
                                                        className="min-w-[140px]"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Full Name</label>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                            <input
                                                                type="text"
                                                                {...profileForm.register("name")}
                                                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                                placeholder="John Doe"
                                                            />
                                                        </div>
                                                        {profileForm.formState.errors.name && (
                                                            <p className="text-red-500 text-xs">{profileForm.formState.errors.name.message}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                            <input
                                                                type="text"
                                                                {...profileForm.register("phone_number")}
                                                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                                placeholder="9876543210"
                                                            />
                                                        </div>
                                                        {profileForm.formState.errors.phone_number && (
                                                            <p className="text-red-500 text-xs">{profileForm.formState.errors.phone_number.message}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium text-foreground">Email Address</label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                            <input
                                                                type="email"
                                                                {...profileForm.register("email")}
                                                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                                placeholder="john@example.com"
                                                            />
                                                        </div>
                                                        {profileForm.formState.errors.email && (
                                                            <p className="text-red-500 text-xs">{profileForm.formState.errors.email.message}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            Note: Changing email might require re-verification.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-4 flex justify-end gap-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleCancelEdit}
                                                        disabled={isUpdating}
                                                        className="min-w-[120px]"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={isUpdating || !profileForm.formState.isDirty}
                                                        className="min-w-[140px]"
                                                        isLoading={isUpdating}
                                                    >
                                                        {!isUpdating && <Save className="mr-2 h-4 w-4" />}
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'bank' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                                    <Landmark className="text-primary" size={24} />
                                                    Bank Details
                                                </h2>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    View and add bank accounts for withdrawals.
                                                </p>
                                            </div>
                                            <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
                                                <DialogTrigger asChild>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Bank Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[500px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Add Bank Account</DialogTitle>
                                                        <DialogDescription>
                                                            Enter your bank details carefully. These will be used for payouts.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form onSubmit={bankForm.handleSubmit(onBankSubmit)} className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2 col-span-2">
                                                                <Label htmlFor="bank_name">Bank Name</Label>
                                                                <Input
                                                                    id="bank_name"
                                                                    placeholder="e.g. State Bank of India"
                                                                    {...bankForm.register("bank_name")}
                                                                />
                                                                {bankForm.formState.errors.bank_name && (
                                                                    <p className="text-red-500 text-xs">{bankForm.formState.errors.bank_name.message}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2 col-span-2">
                                                                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                                                                <Input
                                                                    id="account_holder_name"
                                                                    placeholder="Name as per bank records"
                                                                    {...bankForm.register("account_holder_name")}
                                                                />
                                                                {bankForm.formState.errors.account_holder_name && (
                                                                    <p className="text-red-500 text-xs">{bankForm.formState.errors.account_holder_name.message}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="account_number">Account Number</Label>
                                                                <Input
                                                                    id="account_number"
                                                                    placeholder="Account Number"
                                                                    {...bankForm.register("account_number")}
                                                                />
                                                                {bankForm.formState.errors.account_number && (
                                                                    <p className="text-red-500 text-xs">{bankForm.formState.errors.account_number.message}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="ifsc_code">IFSC Code</Label>
                                                                <Input
                                                                    id="ifsc_code"
                                                                    placeholder="IFSC Code"
                                                                    {...bankForm.register("ifsc_code")}
                                                                />
                                                                {bankForm.formState.errors.ifsc_code && (
                                                                    <p className="text-red-500 text-xs">{bankForm.formState.errors.ifsc_code.message}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2 col-span-2">
                                                                <Label htmlFor="branch_name">Branch Name (Optional)</Label>
                                                                <Input
                                                                    id="branch_name"
                                                                    placeholder="Branch Name"
                                                                    {...bankForm.register("branch_name")}
                                                                />
                                                            </div>
                                                            <div className="flex items-center space-x-2 col-span-2 pt-2">
                                                                <Checkbox
                                                                    id="is_primary"
                                                                    checked={bankForm.watch("is_primary")}
                                                                    onCheckedChange={(checked) => bankForm.setValue("is_primary", checked as boolean)}
                                                                />
                                                                <Label htmlFor="is_primary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                    Set as primary account
                                                                </Label>
                                                            </div>
                                                        </div>
                                                        <DialogFooter className="pt-4">
                                                            <Button type="button" variant="outline" onClick={() => setIsAddBankOpen(false)}>Cancel</Button>
                                                            <Button type="submit" isLoading={isAddingBank}>Add Account</Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {isBankLoading ? (
                                            <Loader center text="Loading bank accounts..." />
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {bankData?.data?.map((bank: BankDetail) => (
                                                    <div
                                                        key={bank.id}
                                                        className={`p-4 rounded-xl border ${bank.is_primary ? 'border-primary bg-primary/5' : 'border-border bg-card'
                                                            } flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-full ${bank.is_primary ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                                <Landmark size={24} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold text-foreground">{bank.bank_name}</h3>
                                                                    {bank.is_primary ? (
                                                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-primary/20">
                                                                            Primary
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground font-mono mt-1">
                                                                    {bank.account_number}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {bank.account_holder_name} • {bank.ifsc_code}
                                                                    {bank.branch_name && ` • ${bank.branch_name}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {/* No Edit/Delete Actions */}
                                                    </div>
                                                ))}

                                                {(!bankData?.data || bankData.data.length === 0) && (
                                                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                                                        <Landmark className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                                        <h3 className="text-lg font-medium text-foreground">No Bank Accounts Added</h3>
                                                        <p className="text-sm text-muted-foreground mb-4">
                                                            Add your bank account to receive payouts.
                                                        </p>
                                                        <Button variant="outline" onClick={() => setIsAddBankOpen(true)}>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Bank Account
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Bank Dialog Removed */}
            </div>
        </>
    );
}
