"use client";
import React from 'react';
import { BarChart2, Smile, CreditCard, Award } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const features = [
    {
        icon: BarChart2,
        title: "Experienced",
        description: "Our team brings decades of combined experience in financial markets, ensuring seasoned guidance for your investments."
    },
    {
        icon: Smile,
        title: "Vibrant",
        description: "We maintain a dynamic and proactive approach, constantly adapting to market changes to maximize your opportunities."
    },
    {
        icon: CreditCard,
        title: "Professional",
        description: "We adhere to the highest standards of integrity and professionalism, putting your financial interests first."
    },
    {
        icon: Award,
        title: "Trademarks",
        description: "Recognized for excellence and innovation in financial services, with a track record of delivering consistent returns."
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const WhyChooseUs = () => {
    return (
        <section className="relative w-full h-auto lg:h-[85vh] lg:overflow-hidden">
            {/* Fixed Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
                }}
            />

            {/* Theme-aware Overlays */}
            {/* Light Mode: White overlay to fade image significantly for black text */}
            <div className="absolute inset-0 z-0 bg-background/90" />

            {/* Gradient Overlay for nuance */}
            <div className="absolute inset-0 z-0 bg-linear-to-r from-background via-background/80 to-background/60" />

            {/* Scrollable Content Overlay */}
            <div className="relative z-10 h-full lg:overflow-y-auto scrollbar-hide">
                <div className="container mx-auto px-4 md:px-10 py-16 lg:py-24 min-h-full flex items-center">
                    <motion.div
                        className="flex flex-col lg:flex-row items-center w-full"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Left Text */}
                        <motion.div
                            className="lg:w-1/3 mb-12 lg:mb-0"
                            variants={itemVariants}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-foreground">
                                <span className="block">Shree Sarwadnya All in one Solutions</span>
                                <span className="text-2xl md:text-4xl block mt-2 font-medium opacity-90">team provides independent advice based on established research methods.</span>
                            </h2>
                            <div className="w-20 h-1 bg-primary rounded-full mb-6" />
                            <p className="text-muted-foreground text-lg">
                                Driven by passion and expertise to deliver outstanding results for your business.
                            </p>
                        </motion.div>

                        {/* Right Grid */}
                        <div className="lg:w-2/3 lg:pl-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex gap-5 group"
                                        variants={itemVariants}
                                    >
                                        <div className="shrink-0 pt-1">
                                            <div className="w-16 h-16 border-2 border-primary/50 group-hover:border-primary rounded-lg flex items-center justify-center text-primary transition-all duration-300 bg-background/50 backdrop-blur-sm shadow-sm">
                                                <feature.icon size={32} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                                            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Custom Scrollbar Styles (optional inline for this component context) */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default WhyChooseUs;
