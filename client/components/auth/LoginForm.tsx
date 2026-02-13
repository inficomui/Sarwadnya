"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useLoginUserMutation } from '@/redux/apies/authApi';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [loginUser, { isLoading }] = useLoginUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // 4. Handle Submit
    const onSubmit = async (data: LoginFormData) => {
        try {
            const result = await loginUser(data).unwrap();

            // Role Validation
            if (result?.user?.role !== 'user') {
                toast.error("Access Denied: Only Users can login here.");
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("tokenType");
                return;
            }

            toast.success("Login Successful!");
            console.log("User Logged In:", result);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (err: any) {
            console.error("Login Failed:", err);
            toast.error(err?.data?.message || "Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
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
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Shree Sarwadnya All in one Solutions Office"
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
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                                <span className="text-2xl font-bold text-white">S</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4 leading-tight">
                                Welcome Back to <br /> <span className="text-primary">Shree Sarwadnya All in one Solutions.</span>
                            </h1>
                            Monitor your wealth accumulation and <br /> <span className="text-primary font-medium">Strategic Investment Growth</span>.
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative z-10 flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 w-fit"
                        >
                            <div className="bg-green-500/20 p-2 rounded-full text-green-400">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">100% Secure Platform</p>
                                <p className="text-xs text-gray-400">Bank-grade encryption</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:w-1/2 p-8 md:p-12 relative flex flex-col justify-center bg-card">

                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-10 text-primary/10 pointer-events-none"
                        >
                            <Lock size={100} fill="currentColor" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative z-10 max-w-md mx-auto w-full"
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">Member Login</h2>
                                <p className="text-muted-foreground">Please sign in to your account.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            {...register("email")}
                                            type="email"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full pl-12 pr-12 py-3.5 bg-muted/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
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
                                    {errors.password && (
                                        <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
                                    )}
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-sm font-semibold text-foreground">Password</label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm font-medium text-primary hover:text-yellow-700 transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-border text-center">
                                <p className="text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        href="/signup"
                                        className="font-bold text-foreground hover:text-primary transition-colors"
                                    >
                                        Create account
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