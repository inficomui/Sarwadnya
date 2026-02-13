"use client";

import React from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Link from "next/link";
import { useCreateUserMutation } from "@/redux/apies/usersCrudApi";

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    referral_code: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});

type UserFormValues = z.infer<typeof userSchema>;

export default function CreateUserPage() {
    const router = useRouter();
    const [createUser, { isLoading }] = useCreateUserMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
    });

    const onSubmit = async (data: UserFormValues) => {
        try {
            await createUser(data).unwrap();
            router.push("/admin/dashboard/users");
        } catch (error: any) {
            console.error("Failed to create user", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/users">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Create New User</h1>
                    <p className="text-muted-foreground text-sm">Add a new user to the system.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="text-sm font-medium">Referral Code (Optional)</label>
                            <input
                                {...register("referral_code")}
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="REF123"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <input
                                {...register("password")}
                                type="password"
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <input
                                {...register("password_confirmation")}
                                type="password"
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-xs">{errors.password_confirmation.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/admin/dashboard/users">
                            <button type="button" className="px-4 py-2 hover:bg-muted rounded-lg text-sm font-medium transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
