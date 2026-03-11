"use client";
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { userSidebarItems } from '@/lib/userSidebarItems';
import { useSubmitTestimonialMutation } from '@/redux/apies/testimonialApi';
import { MessageSquareQuote, Star, Upload, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const testimonialSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    designation: z.string().optional(),
    company: z.string().optional(),
    content: z.string().min(10, "Testimonial must be at least 10 characters").max(500, "Testimonial cannot exceed 500 characters"),
    rating: z.number().min(1).max(5),
    avatar: z.any().optional()
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export default function TestimonialsPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const [createTestimonial, { isLoading }] = useSubmitTestimonialMutation();
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TestimonialFormValues>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            name: user?.name || '',
            designation: '',
            company: '',
            content: '',
            rating: 5,
        }
    });

    const rating = watch("rating");

    const handleRatingChange = (newRating: number) => {
        setValue("rating", newRating);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const onSubmit = async (data: TestimonialFormValues) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('content', data.content);
            if (data.designation) formData.append('designation', data.designation);
            if (data.company) formData.append('company', data.company);
            formData.append('rating', data.rating.toString());
            if (avatarFile) formData.append('avatar', avatarFile);

            await createTestimonial(formData).unwrap();
            toast.success('Testimonial submitted successfully!');
            reset();
            setAvatarFile(null);
            setValue("rating", 5);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.data?.message || 'Failed to submit testimonial. Please try again.');
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Share Your Experience</h1>
                    <p className="text-muted-foreground mt-1">Submit a testimonial and let others know about your journey with us.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                                    <input
                                        type="text"
                                        {...register("name")}
                                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Designation</label>
                                    <input
                                        type="text"
                                        {...register("designation")}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="CEO, Manager, etc."
                                    />
                                    {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Company</label>
                                    <input
                                        type="text"
                                        {...register("company")}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Company Name"
                                    />
                                    {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(star)}
                                            className={`p-1 rounded-full transition-colors ${rating >= star ? 'text-yellow-500' : 'text-muted-foreground/30'}`}
                                        >
                                            <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Your Testimonial</label>
                                <textarea
                                    {...register("content")}
                                    rows={4}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    placeholder="Share your feedback..."
                                />
                                {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Profile Picture</label>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {avatarFile ? (
                                        <div className="flex items-center gap-2 text-primary font-medium">
                                            <div className="w-10 h-10 rounded-full overflow-hidden object-cover bg-muted">
                                                <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="truncate max-w-[200px]">{avatarFile.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG up to 2MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 size={20} className="animate-spin" />}
                                Submit Testimonial
                            </button>
                        </form>
                    </motion.div>

                    <div className="space-y-6">
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <MessageSquareQuote size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Why Submit a Testimonial?</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Your feedback helps us improve our services and helps other investors make informed decisions. We value your honest opinion about your experience with Shree Sarwadnya All in one Solutions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
