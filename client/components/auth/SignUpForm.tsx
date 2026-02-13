"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, TrendingUp, Phone, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLazyGetReferralByCodeQuery } from '@/redux/apies/authApi';


const signUpSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    terms: z.boolean().refine((val) => val === true, "You must agree to the terms and privacy policy"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
    const router = useRouter();
    const { register: registerUser, isRegistering, isAuthenticated } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    // Redirect if already authenticated
    // Redirect if already authenticated - REMOVED to allow viewing referral link logic
    /* 
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);
    */

    const testimonials = [
        {
            text: "The best platform for secure forex investment. Returns are always on time.",
            author: "Rajesh K.",
            role: "Gold Plan Investor",
            initials: "RK"
        },
        {
            text: "Shree Sarwadnya All in one Solutions managed my portfolio with exceptional transparency. Highly recommended!",
            author: "Sneha M.",
            role: "Platinum Plan Investor",
            initials: "SM"
        },
        {
            text: "I was skeptical at first, but the monthly returns have been consistent and reliable.",
            author: "Vikram S.",
            role: "Silver Plan Investor",
            initials: "VS"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const searchParams = useSearchParams();
    const urlReferralCode = searchParams.get('ref');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            referralCode: urlReferralCode || '',
            terms: false,
        },
    });

    useEffect(() => {
        if (urlReferralCode) {
            setValue('referralCode', urlReferralCode);
        }
    }, [urlReferralCode, setValue]);

    // Referral Lookup Logic
    const referralCode = watch('referralCode');
    const [triggerReferralLookup, { data: referralData, isFetching: isCheckingReferral, isError: isReferralError, error: referralError }] = useLazyGetReferralByCodeQuery();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (referralCode && referralCode.length >= 3) {
                triggerReferralLookup(referralCode);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [referralCode, triggerReferralLookup]);

    const onSubmit = async (data: SignUpFormData) => {
        const loadingToast = toast.loading("Creating your account...");

        // Map form data to API payload format
        const registrationData = {
            name: data.fullName,
            email: data.email,
            phone_number: data.phone,
            password: data.password,
            password_confirmation: data.confirmPassword,
            referral_code: data.referralCode || undefined
        };

        // Call registration API
        const result = await registerUser(registrationData);

        if (result.success) {
            toast.success("Account created successfully!", {
                id: loadingToast,
                duration: 4500
            });
            // Redirect to home or dashboard
            setTimeout(() => {
                router.push('/');
            }, 4500);
        } else {
            // Toast is handled in useAuth usually, but we can double check or show specific error if needed
            if (result.error) {
                console.error(result.error);
                toast.error(result.error || "Registration failed", {
                    id: loadingToast,
                    duration: 4500
                });
            } else {
                toast.dismiss(loadingToast);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            {/* Blurred Blob for depth */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none" />
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gray-900/5 rounded-full blur-3xl z-0 pointer-events-none" />

            {/* --- 2. Main Card Container --- */}
            <div className="container max-w-6xl mx-auto relative z-10">
                <div className="bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row-reverse min-h-[600px] border border-border">
                    <div className="lg:w-1/2 relative bg-gray-900 text-white p-12 flex flex-col justify-between overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://plus.unsplash.com/premium_photo-1733317248765-0b0da954e7fe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RmluYW5jZSUyMEdyb3d0aHxlbnwwfHwwfHx8MA%3D%3D"
                                alt="Growth"
                                className="w-full h-full object-cover opacity-30"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-gray-900/50 to-transparent"></div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-right mt-10"
                        >
                            <div className="inline-flex w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl items-center justify-center mb-6 border border-primary/20">
                                <TrendingUp size={32} className="text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold mb-4 leading-tight">
                                Start Your Wealth <br /> <span className="text-primary">Journey Today.</span>
                            </h1>
                            <p className="text-gray-300 text-lg max-w-md ml-auto">
                                Join Shree Sarwadnya All in one Solutions and earn <span className="text-white font-semibold">Industry-Leading Returns</span> securely.
                            </p>
                        </motion.div>

                        {/* Trust Badge / Testimonial Slider */}
                        <div className="relative z-10 w-full max-w-sm ml-auto min-h-[160px]">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentTestimonial}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white/10 backdrop-blur-md border border-white/10 text-white p-6 rounded-2xl shadow-xl w-full"
                                >
                                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                                        {"★★★★★".split("").map((star, i) => <span key={i}>{star}</span>)}
                                    </div>
                                    <p className="font-light italic text-sm mb-3 opacity-90 min-h-[40px]">
                                        "{testimonials[currentTestimonial].text}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                            {testimonials[currentTestimonial].initials}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{testimonials[currentTestimonial].author}</p>
                                            <p className="text-[10px] text-gray-400">{testimonials[currentTestimonial].role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* --- LEFT SIDE: Your Form Implementation --- */}
                    <div className="lg:w-1/2 p-8 md:p-12 relative flex flex-col justify-center bg-card">

                        {/* Floating Icon Decoration */}
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-6 left-6 text-primary/10 pointer-events-none"
                        >
                            <User size={120} fill="currentColor" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative z-10 max-w-md mx-auto w-full"
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
                                <p className="text-muted-foreground">Enter your details to register.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input
                                            {...register("fullName")}
                                            type="text"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-xs text-red-500 font-medium ml-1">{errors.fullName.message}</p>}
                                </div>

                                {/* Email & Phone Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-foreground ml-1">Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                {...register("email")}
                                                type="email"
                                                className={`w-full pl-12 pr-4 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                                placeholder="user@site.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-foreground ml-1">Phone</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <Phone size={20} />
                                            </div>
                                            <input
                                                {...register("phone")}
                                                type="tel"
                                                className={`w-full pl-12 pr-4 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                                placeholder="+91 987..."
                                            />
                                        </div>
                                        {errors.phone && <p className="text-xs text-red-500 font-medium ml-1">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full pl-12 pr-12 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                            placeholder="Create a password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-foreground ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <input
                                            {...register("confirmPassword")}
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full pl-12 pr-12 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>}

                                    {/* Referral Code (Optional) */}
                                    <div className="space-y-1 pt-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">
                                            Referral Code <span className="text-muted-foreground text-xs">(Optional)</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                </svg>
                                            </div>
                                            <input
                                                {...register("referralCode")}
                                                type="text"
                                                className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                                placeholder="Enter referral code"
                                            />
                                        </div>
                                        {/* Referrer Details / Error */}
                                        <div className="min-h-[20px] mt-1 ml-1 px-1">
                                            {isCheckingReferral && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                                                </p>
                                            )}
                                            {!isCheckingReferral && referralData && !isReferralError && referralCode && (
                                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <User size={12} /> Referred by: {referralData.name}
                                                </p>
                                            )}
                                            {!isCheckingReferral && isReferralError && referralCode && (
                                                <p className="text-xs text-red-500 font-medium">
                                                    Invalid referral code
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex flex-col gap-1 py-2">
                                    <div className="flex items-start gap-3">
                                        <input
                                            {...register("terms")}
                                            type="checkbox"
                                            id="terms"
                                            className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                                        />
                                        <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                                            I agree to the <Link href="/terms" className="text-foreground hover:text-primary transition-colors font-medium">Terms</Link> and <Link href="/privacy" className="text-foreground hover:text-primary transition-colors font-medium">Privacy Policy</Link>
                                        </label>
                                    </div>
                                    {errors.terms && <p className="text-xs text-red-500 font-medium ml-7">{errors.terms.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isRegistering}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isRegistering ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-border text-center">
                                <p className="text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link
                                        href="/login"
                                        className="font-bold text-foreground hover:text-primary transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>

                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}