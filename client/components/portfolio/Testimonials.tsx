"use client";
import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGetTestimonialsQuery } from '@/redux/apies/testimonialApi';


const Testimonials = () => {
    const { data: testimonialsData, isLoading, isError } = useGetTestimonialsQuery();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    const testimonials = testimonialsData?.data || [];

    // Auto-play logic
    useEffect(() => {
        if (testimonials.length === 0) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex, testimonials.length]);

    const nextSlide = () => {
        if (testimonials.length === 0) return;
        setDirection(1);
        setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (testimonials.length === 0) return;
        setDirection(-1);
        setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    // Animation Variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
            position: 'absolute' as 'absolute' // Correctly typed for Framer Motion
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            position: 'relative' as 'relative'
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
            position: 'absolute' as 'absolute'
        })
    };

    if (isLoading) {
        return <div className="py-24 text-center">Loading testimonials...</div>;
    }

    if (isError || testimonials.length === 0) {
        return null; // Or show a fallback/empty state
    }

    const currentTestimonial = testimonials[currentIndex];

    // Safe lookup 
    const currentAvatar = currentTestimonial?.avatar?.startsWith('http')
        ? currentTestimonial.avatar
        : currentTestimonial?.avatar
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${currentTestimonial.avatar}`
            : null;

    return (
        <section className="py-24 bg-background relative overflow-hidden">

            {/* --- Background Pattern (Consistent with Theme) --- */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            {/* Decorative Quotes Background */}
            <div className="absolute top-10 left-10 text-primary/5 hidden md:block">
                <Quote size={180} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-12 h-1 bg-primary rounded-full"></span>
                        <h4 className="text-primary font-bold uppercase tracking-widest text-xs">
                            Success Stories
                        </h4>
                        <span className="w-12 h-1 bg-primary rounded-full"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        What Our Investors Say
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover how Shree Sarwadnya All in one Solutions is helping individuals achieve financial freedom through smart market strategies.
                    </p>
                </motion.div>

                {/* Slider Container */}
                <div className="max-w-5xl mx-auto relative group">

                    {/* Navigation Buttons (Desktop: Sides, Mobile: Hidden/Bottom) */}
                    {testimonials.length > 1 && (
                        <>
                            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-20 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={prevSlide}
                                    className="p-3 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-20 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={nextSlide}
                                    className="p-3 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-300"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Main Content Card */}
                    <div className="bg-card rounded-3xl shadow-xl shadow-border/5 p-8 md:p-12 border border-border relative min-h-[400px] flex items-center justify-center overflow-hidden">

                        {/* Gold Quote Icon Top */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-primary/20 z-0">
                            <Quote size={60} fill="currentColor" />
                        </div>

                        {/* Slider Track - using Grid for overlap */}
                        <div className="relative w-full h-full grid grid-cols-1 grid-rows-1 items-center justify-center z-10">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="w-full text-center col-start-1 row-start-1"
                                >
                                    {/* Rating Stars */}
                                    <div className="flex justify-center gap-1 mb-8 mt-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={20}
                                                className={`${star <= currentTestimonial.rating ? "text-primary fill-primary" : "text-muted-foreground/20 fill-transparent"}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-muted-foreground text-lg md:text-2xl italic leading-relaxed mb-10 font-medium">
                                        "{currentTestimonial.content}"
                                    </p>

                                    {/* User Profile */}
                                    <div className="flex flex-col items-center justify-center">
                                        {currentAvatar ? (
                                            <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-primary/20">
                                                <img
                                                    src={currentAvatar}
                                                    alt={currentTestimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-primary/20 bg-primary/10 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary">{currentTestimonial.name.charAt(0)}</span>
                                            </div>
                                        )}
                                        <h3 className="font-bold text-xl text-foreground mb-1">
                                            {currentTestimonial.name}
                                        </h3>
                                        <p className="text-primary font-medium text-sm tracking-wide uppercase">
                                            {currentTestimonial.designation} {currentTestimonial.company ? `, ${currentTestimonial.company}` : ''}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-3 mt-8">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? "w-10 bg-primary"
                                        : "w-2.5 bg-muted hover:bg-primary/50"
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Mobile Only: Navigation Arrows Below */}
                    {testimonials.length > 1 && (
                        <div className="flex md:hidden justify-center gap-6 mt-6">
                            <button onClick={prevSlide} className="p-3 bg-card shadow-md border border-border rounded-full text-muted-foreground">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextSlide} className="p-3 bg-card shadow-md border border-border rounded-full text-muted-foreground">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};
export default Testimonials;
