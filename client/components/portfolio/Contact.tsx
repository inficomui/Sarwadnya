"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Validation Schema ---
const contactSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    company: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
    services: z.array(z.string()).optional(),
    bestTime: z.string().optional(),
    hearAbout: z.string().optional(),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const servicesOptions = [
    "Investment Planning",
    "Loan Sanction",
    "Mutual Funds",
    "Insurance Consulting",
    "Taxes Consulting",
    "Others"
];

const Contact = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            services: []
        }
    });

    const onSubmit = async (data: ContactFormValues) => {
        // Simulate API call
        console.log("Form Data:", data);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
    };

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 md:px-10">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* --- Left: Contact Form --- */}
                    <div className="lg:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Contact Us</h2>
                            <p className="text-muted-foreground mb-10 leading-relaxed">
                                Want to work with us or need more details about our services? Fill out the form below and our team will get back to you shortly.
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Name & Company */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            {...register("name")}
                                            placeholder="Name *"
                                            className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full"
                                        />
                                        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            {...register("company")}
                                            placeholder="Company"
                                            className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full"
                                        />
                                    </div>
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            {...register("email")}
                                            placeholder="Email *"
                                            type="email"
                                            className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full"
                                        />
                                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            {...register("phone")}
                                            placeholder="Phone *"
                                            type="tel"
                                            className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full"
                                        />
                                        {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                                    </div>
                                </div>

                                {/* Services Interests */}
                                <div>
                                    <label className="block text-muted-foreground mb-4 font-medium">Services You Interested</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {servicesOptions.map((service, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value={service}
                                                    {...register("services")}
                                                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary bg-background"
                                                />
                                                <span className="text-muted-foreground text-sm">{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-muted-foreground text-sm">Best Time to Reach</label>
                                        <select
                                            {...register("bestTime")}
                                            className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary transition-colors w-full text-foreground"
                                        >
                                            <option value="">Please select</option>
                                            <option value="morning">Morning</option>
                                            <option value="afternoon">Afternoon</option>
                                            <option value="evening">Evening</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-muted-foreground text-sm">Hear About Us</label>
                                        <select
                                            {...register("hearAbout")}
                                            className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary transition-colors w-full text-foreground"
                                        >
                                            <option value="">Please select</option>
                                            <option value="friends">Friends</option>
                                            <option value="social">Social Media</option>
                                            <option value="search">Search Engine</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="flex flex-col space-y-2">
                                    <textarea
                                        {...register("message")}
                                        placeholder="Messages *"
                                        rows={6}
                                        className="bg-muted/50 border border-border p-4 rounded-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full resize-none"
                                    />
                                    {errors.message && <span className="text-red-500 text-sm">{errors.message.message}</span>}
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? "SENDING..." : "SUBMIT"}
                                        {isSuccess && <Check size={20} />}
                                    </button>
                                    {isSuccess && <p className="text-green-600 mt-2 font-medium">Message sent successfully!</p>}
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* --- Right: Contact Info --- */}
                    <div className="lg:w-1/3 pt-8 md:pt-20">
                        <div className="space-y-8">
                            {/* Address */}
                            <div className="flex gap-4">
                                <div className="shrink-0 text-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        T-21/4, Opposite to ExpertGlobal,<br />
                                        Next to Ambuja cement, Software Technology Park of India(STPI),<br />
                                        MIDC, Aurangabad-431006.
                                    </p>
                                </div>
                            </div>

                            {/* Phones */}
                            <div className="flex gap-4">
                                <div className="shrink-0 text-primary">
                                    <Phone size={24} />
                                </div>
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <a href="tel:+919270543819" className="hover:text-primary">+91 92705 43819</a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-4">
                                <div className="shrink-0 text-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <a href="mailto:sarwadnyaallinonesolutions@gmail.com" className="text-primary hover:underline text-sm">sarwadnyaallinonesolutions@gmail.com</a>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="flex gap-4">
                                <div className="shrink-0 text-primary">
                                    <Clock size={24} />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Sat - Thu: 8AM - 7PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
