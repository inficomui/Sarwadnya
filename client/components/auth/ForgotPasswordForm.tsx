"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, KeyRound, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useSendPasswordResetOTPMutation, useVerifyPasswordResetOTPMutation, useResetPasswordMutation } from '@/redux/apies/authApi';

// --- Zod Schemas ---
const identifierSchema = z.object({
    identifier: z.string().min(1, { message: "Email or Phone is required" }),
});

const otpSchema = z.object({
    otp: z.string().min(4, { message: "OTP must be at least 4 digits" }).max(6, { message: "OTP must be at most 6 digits" }),
});

const passwordSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type IdentifierFormData = z.infer<typeof identifierSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Identifier, 2: OTP, 3: New Password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [identifier, setIdentifier] = useState("");

    // RTK Query Mutations
    const [sendOTP, { isLoading: isSendingOTP }] = useSendPasswordResetOTPMutation();
    const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyPasswordResetOTPMutation();
    const [resetPasswordAPI, { isLoading: isResettingPassword }] = useResetPasswordMutation();

    // --- Forms ---
    const identifierForm = useForm<IdentifierFormData>({ resolver: zodResolver(identifierSchema) });
    const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });
    const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

    // --- Handlers ---

    // Step 1: Send OTP
    const onIdentifierSubmit = async (data: IdentifierFormData) => {
        try {
            const response = await sendOTP({ identifier: data.identifier }).unwrap();
            setIdentifier(data.identifier);
            toast.success(response.message || `OTP sent to ${data.identifier}`);
            setStep(2);
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            toast.error(error?.data?.message || "Failed to send OTP. Please try again.");
        }
    };

    // Step 2: Verify OTP
    const onOtpSubmit = async (data: OtpFormData) => {
        try {
            const response = await verifyOTP({ identifier, otp: data.otp }).unwrap();
            toast.success(response.message || "OTP Verified Successfully!");
            setStep(3);
        } catch (error: any) {
            console.error("Error verifying OTP:", error);
            toast.error(error?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    // Step 3: Reset Password
    const onPasswordSubmit = async (data: PasswordFormData) => {
        try {
            const response = await resetPasswordAPI({
                identifier,
                otp: otpForm.getValues("otp"),
                password: data.password,
                password_confirmation: data.confirmPassword
            }).unwrap();
            toast.success(response.message || "Password Reset Successfully!");

            setTimeout(() => {
                router.push('/login');
            }, 1000);
        } catch (error: any) {
            console.error("Error resetting password:", error);
            toast.error(error?.data?.message || "Failed to reset password. Please try again.");
        }
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
            <Toaster position="top-center" />
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-900/5 rounded-full blur-3xl z-0 pointer-events-none" />

            <div className="container max-w-6xl mx-auto relative z-10">
                <div className="bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-border">
                    <div className="lg:w-1/2 relative bg-gray-900 text-white p-12 flex flex-col justify-between overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Security"
                                className="w-full h-full object-cover opacity-20"
                            />
                            <div className="absolute inset-0 bg-linear-to-b from-gray-900 via-gray-900/80 to-primary/20"></div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10"
                        >
                            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
                                <ChevronLeft size={20} />
                                <span>Back to Home</span>
                            </Link>

                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                                <KeyRound className="text-white" size={24} />
                            </div>
                            <h1 className="text-4xl font-bold mb-4 leading-tight">
                                Forgot your <br /> <span className="text-primary">Password?</span>
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Don't worry, it happens to the best of us. <br /> Follow the steps to recover your account.
                            </p>
                        </motion.div>

                        {/* Progress Indicators */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative z-10 hidden lg:flex gap-4 mt-8"
                        >
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300 ${step >= s ? 'bg-primary border-primary text-white' : 'border-white/20 text-white/40'}`}>
                                        {step > s ? <CheckCircle2 size={20} /> : s}
                                    </div>
                                    <span className={`text-xs font-medium uppercase tracking-wider ${step >= s ? 'text-primary' : 'text-white/40'}`}>
                                        {s === 1 ? 'Details' : s === 2 ? 'OTP' : 'Reset'}
                                    </span>
                                </div>
                            ))}
                            {/* Connecting Lines */}
                            <div className="absolute top-5 left-10 w-full h-[2px] bg-white/10 -z-10" />
                            {/* The lines would need more intricate CSS to look perfect between dots, keeping it simple for now or using absolute positioning lines between the specific elements if needed. 
                                 A simpler approach for the lines: */}
                        </motion.div>

                        <div className="relative z-10 mt-auto">
                            <p className="text-xs text-white/40">
                                &copy; {new Date().getFullYear()} Shree Sarwadnya All in one Solutions. All rights reserved.
                            </p>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: Forms --- */}
                    <div className="lg:w-1/2 p-8 md:p-12 relative flex flex-col justify-center bg-card">

                        {/* Floating Icon Decoration */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-10 text-primary/10 pointer-events-none"
                        >
                            <KeyRound size={100} fill="currentColor" />
                        </motion.div>

                        <div className="relative z-10 max-w-md mx-auto w-full">
                            <AnimatePresence mode='wait'>
                                {/* STEP 1: Identifier (Email/Phone) */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-bold text-foreground mb-2">Reset Password</h2>
                                            <p className="text-muted-foreground">Enter your email or phone number to receive a One-Time Password (OTP).</p>
                                        </div>

                                        <form onSubmit={identifierForm.handleSubmit(onIdentifierSubmit)} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground ml-1">Email or Phone</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                        <Mail size={20} />
                                                    </div>
                                                    <input
                                                        {...identifierForm.register("identifier")}
                                                        type="text"
                                                        className={`w-full pl-12 pr-4 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${identifierForm.formState.errors.identifier ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                                        placeholder="name@example.com or 9876543210"
                                                    />
                                                </div>
                                                {identifierForm.formState.errors.identifier && (
                                                    <p className="text-xs text-red-500 font-medium ml-1">{identifierForm.formState.errors.identifier.message}</p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSendingOTP}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-70"
                                            >
                                                {isSendingOTP ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight size={20} /></>}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* STEP 2: OTP */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="mb-8">
                                            <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">
                                                <ChevronLeft size={16} /> Back
                                            </button>
                                            <h2 className="text-3xl font-bold text-foreground mb-2">Enter OTP</h2>
                                            <p className="text-muted-foreground">We have sent a code to <span className="font-semibold text-foreground">{identifier}</span></p>
                                        </div>

                                        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground ml-1">One-Time Password</label>
                                                <input
                                                    {...otpForm.register("otp")}
                                                    type="text"
                                                    maxLength={6}
                                                    className={`w-full text-center tracking-[1em] text-2xl font-bold py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${otpForm.formState.errors.otp ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                                    placeholder="0000"
                                                />
                                                {otpForm.formState.errors.otp && (
                                                    <p className="text-xs text-red-500 font-medium ml-1">{otpForm.formState.errors.otp.message}</p>
                                                )}
                                            </div>
                                            <div className="text-center text-sm">
                                                <p className="text-muted-foreground">Didn't receive the code? <button type="button" onClick={() => toast.success("OTP Resent!")} className="text-primary font-bold hover:underline">Resend</button></p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isVerifyingOTP}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-70"
                                            >
                                                {isVerifyingOTP ? <Loader2 className="animate-spin" /> : <>Verify Code <CheckCircle2 size={20} /></>}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* STEP 3: New Password */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-bold text-foreground mb-2">Set New Password</h2>
                                            <p className="text-muted-foreground">Create a strong password to secure your account.</p>
                                        </div>

                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground ml-1">New Password</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                        <Lock size={20} />
                                                    </div>
                                                    <input
                                                        {...passwordForm.register("password")}
                                                        type={showPassword ? "text" : "password"}
                                                        className={`w-full pl-12 pr-12 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${passwordForm.formState.errors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.password && (
                                                    <p className="text-xs text-red-500 font-medium ml-1">{passwordForm.formState.errors.password.message}</p>
                                                )}
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground ml-1">Confirm Password</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                        <ShieldCheck size={20} />
                                                    </div>
                                                    <input
                                                        {...passwordForm.register("confirmPassword")}
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className={`w-full pl-12 pr-12 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${passwordForm.formState.errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.confirmPassword && (
                                                    <p className="text-xs text-red-500 font-medium ml-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isResettingPassword}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-70"
                                            >
                                                {isResettingPassword ? <Loader2 className="animate-spin" /> : <>Reset Password <ArrowRight size={20} /></>}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t border-border text-center">
                                <p className="text-muted-foreground">
                                    Remember your password?{' '}
                                    <Link
                                        href="/login"
                                        className="font-bold text-foreground hover:text-primary transition-colors"
                                    >
                                        Back to Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
