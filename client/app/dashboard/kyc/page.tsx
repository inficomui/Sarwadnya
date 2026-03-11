"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserKycFieldsQuery, useCheckUserKycStatusQuery, useSubmitUserKycMutation } from '@/redux/apies/kycApi';
import {
    LayoutDashboard,
    Users,
    Settings,
    Shield,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeftRight,
    FileText,
    type LucideIcon,
    XCircle,
    Clock,
    Eye,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { userSidebarItems } from '@/lib/userSidebarItems';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

export default function KycPage() {
    const { user, logout, isLoggingOut } = useAuth();

    // API Hooks
    const { data: kycStatusData, isLoading: isStatusLoading, refetch: refetchStatus } = useCheckUserKycStatusQuery();
    const { data: fieldsData, isLoading: isFieldsLoading } = useGetUserKycFieldsQuery();
    const [submitKyc, { isLoading: isSubmitting }] = useSubmitUserKycMutation();

    // Form State
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [files, setFiles] = useState<Record<string, File>>({});
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [dragActive, setDragActive] = useState<string | null>(null);
    const [bannedMessage, setBannedMessage] = useState<string | null>(null);

    // Sidebar items
    // Use imported userSidebarItems


    const kycStatus = kycStatusData ? kycStatusData.status : null;
    const adminMessage = kycStatusData ? kycStatusData.admin_message : null;

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        setFormData({
            ...formData,
            [fieldName]: e.target.value
        });
    };

    const updateFileAndPreview = (file: File, fieldName: string) => {
        // Create new preview
        const objectUrl = URL.createObjectURL(file);

        // Revoke old preview if it exists
        if (previews[fieldName]) {
            URL.revokeObjectURL(previews[fieldName]);
        }

        setFiles(prev => ({ ...prev, [fieldName]: file }));
        setPreviews(prev => ({ ...prev, [fieldName]: objectUrl }));
    };

    const removeFile = (fieldName: string) => {
        if (previews[fieldName]) {
            URL.revokeObjectURL(previews[fieldName]);
        }

        const newFiles = { ...files };
        delete newFiles[fieldName];
        setFiles(newFiles);

        const newPreviews = { ...previews };
        delete newPreviews[fieldName];
        setPreviews(newPreviews);

        // Reset file input if possible (optional, handled by key or ref usually, but logic holds)
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files && e.target.files[0]) {
            updateFileAndPreview(e.target.files[0], fieldName);
        }
    };

    // Drag and Drop handlers
    const handleDrag = (e: React.DragEvent, fieldName: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(fieldName);
        } else if (e.type === "dragleave") {
            setDragActive(null);
        }
    };

    const handleDrop = (e: React.DragEvent, fieldName: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            updateFileAndPreview(e.dataTransfer.files[0], fieldName);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        // Append text fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        // Append files
        Object.keys(files).forEach(key => {
            data.append(key, files[key]);
        });
        Object.keys(previews).forEach(url => URL.revokeObjectURL(url));

        try {
            await submitKyc(data).unwrap();
            toast.success("KYC Submitted Successfully!");
            refetchStatus();
        } catch (error: any) {
            console.error("KYC Submit Error:", error);
            const errorMsg = error?.data?.message || "Failed to submit KYC";

            if (errorMsg === "Duplicate PAN detected. This PAN is already registered with another account. Your account has been banned due to violation of policies.") {
                setBannedMessage(errorMsg);
                return;
            }

            toast.error(errorMsg);
        }
    };

    const handleView = (fieldName: string) => {
        if (previews[fieldName]) {
            window.open(previews[fieldName], '_blank');
        }
    };

    const sortedFields = fieldsData ? [...fieldsData].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const renderContent = () => {
        if (isStatusLoading || isFieldsLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary/40 animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-4 text-muted-foreground font-medium animate-pulse">Retrieving KYC Status...</p>
                </div>
            );
        }

        if (kycStatus === 'approved') {
            return (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto mt-10"
                >
                    <div className="relative bg-card border border-border rounded-3xl p-12 text-center shadow-2xl overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 to-green-500"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-24 h-24 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-500/30"
                            >
                                <CheckCircle className="w-12 h-12" />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-foreground mb-3">Verified & Approved</h2>
                            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                Your identity has been successfully verified. You now have unrestricted access to all platform features, withdrawals, and transfers.
                            </p>

                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full font-semibold text-sm">
                                <Shield className="w-4 h-4" />
                                <span>Official Member</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        if (kycStatus === 'pending') {
            return (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto mt-10"
                >
                    <div className="relative bg-card border border-border rounded-3xl p-12 text-center shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-amber-400 to-orange-500"></div>

                        <div className="relative z-10">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-amber-100 dark:bg-amber-900/10 dark:ring-amber-900/30"
                            >
                                <Clock className="w-10 h-10 text-amber-500" />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-foreground mb-3">Verification In Progress</h2>
                            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                We are currently reviewing your documents. Our team typically processes requests within 24-48 hours.
                            </p>

                            <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 text-left max-w-md mx-auto">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Documents Received</h4>
                                        <p className="text-xs text-muted-foreground">Securely stored and encrypted</p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <LayoutDashboard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Admin Review</h4>
                                        <p className="text-xs text-muted-foreground">Currently in queue</p>
                                    </div>
                                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin ml-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // Default: Show Form (Status null or rejected)
        return (
            <div className="max-w-5xl mx-auto py-8">
                <AnimatePresence>
                    {kycStatus === 'rejected' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-5 shadow-sm"
                        >
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl h-fit w-fit">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-700 dark:text-red-400 text-lg mb-1">Update Required</h3>
                                <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4 leading-relaxed">
                                    Your previous application was returned. Please address the feedback below and resubmit.
                                </p>
                                {adminMessage && (
                                    <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-red-100 dark:border-red-900/20 text-sm">
                                        <span className="font-bold text-red-800 dark:text-red-300 block mb-1">Feedback from Admin:</span>
                                        <span className="text-red-700 dark:text-red-400/90">{adminMessage}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                >
                    {/* Header Bar - Matching requested style but modernized */}
                    <div className="bg-linear-to-r from-red-500 to-rose-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md">
                        <div className="flex items-center gap-3 text-white">
                            <FileText className="w-6 h-6" />
                            <h2 className="text-lg font-bold tracking-wide uppercase">KYC Information</h2>
                        </div>
                        <div className="text-white/90 text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            Max Size - 500 KB For Each
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {(!fieldsData || fieldsData.length === 0) ? (
                            <div className="text-center py-20 px-4">
                                <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No Requirements Found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    No KYC fields are currently configured. Please check back later.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {sortedFields.map((field, index) => (
                                    <motion.div
                                        key={field.id}
                                        variants={itemVariants}
                                        className="p-6 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Label Section */}
                                            <div className="md:w-1/3">
                                                <label className="text-base font-semibold text-foreground flex items-center gap-2">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 text-xs mt-1">*</span>}
                                                </label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {field.type === 'file' ? 'Document Upload' : 'Text Input'}
                                                </p>
                                            </div>

                                            {/* Input/Action Section */}
                                            <div className="md:w-1/3 flex justify-center md:justify-start">
                                                {field.type === 'file' ? (
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id={field.name}
                                                            required={field.required && !files[field.name]}
                                                            accept="image/*,application/pdf"
                                                            onChange={(e) => handleFileChange(e, field.name)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => document.getElementById(field.name)?.click()}
                                                            className={`
                                                                w-40 shadow-sm transition-all
                                                                ${files[field.name]
                                                                    ? 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                                                                    : index % 3 === 0 ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                                        : index % 3 === 1 ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                                                                }
                                                            `}
                                                        >
                                                            {files[field.name] ? (
                                                                <>
                                                                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                                                                    Change
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-4 h-4 mr-2" />
                                                                    Browse...
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        required={field.required}
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => handleInputChange(e, field.name)}
                                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                                                        placeholder={`Enter ${field.label}...`}
                                                    />
                                                )}
                                            </div>

                                            {/* Status Section */}
                                            <div className="md:w-1/3 flex items-center justify-between md:justify-end gap-4">
                                                {field.type === 'file' ? (
                                                    files[field.name] ? (
                                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                                            <div className="flex-1 min-w-0 md:text-right">
                                                                <p className="text-xs font-medium text-green-600 dark:text-green-400 truncate max-w-[150px] ml-auto">
                                                                    {files[field.name].name}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {(files[field.name].size / 1024).toFixed(0)} KB
                                                                </p>
                                                            </div>
                                                            {previews[field.name] && files[field.name].type.startsWith('image/') && (
                                                                <div
                                                                    onClick={() => handleView(field.name)}
                                                                    className="w-10 h-10 rounded-lg overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all shrink-0"
                                                                >
                                                                    <img src={previews[field.name]} alt="Preview" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                            <XCircle className="w-4 h-4 text-muted-foreground/50" />
                                                            Not Uploaded
                                                        </span>
                                                    )
                                                ) : (
                                                    formData[field.name] ? (
                                                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" /> Filled
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">Required</span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="p-8 bg-muted/5 flex justify-center border-t border-border">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto min-w-[200px] bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 text-lg shadow-lg hover:shadow-amber-600/20 transition-all rounded-lg"
                                disabled={isSubmitting || (!fieldsData || fieldsData.length === 0)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5 mr-2" />
                                        Save Information
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    };

    return (
        <>
            <div className="min-h-screen bg-transparent">
                {/* Container wrapper moved inside renderContent or wrapped here if needed globally */}
                <div className="container max-w-6xl mx-auto px-4 py-8 sm:px-6">
                    {renderContent()}
                </div>
            </div>

            <Dialog open={!!bannedMessage} onOpenChange={() => { /* Prevent closing by clicking outside */ }}>
                <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            Account Banned
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-base text-foreground font-medium">
                            {bannedMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            variant="destructive"
                            onClick={() => logout()}
                            className="w-full sm:w-auto"
                        >
                            Acknowledge & Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
