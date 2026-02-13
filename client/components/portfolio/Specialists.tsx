"use client";
import React from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, UserCheck, Users, ClipboardCheck } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const specialists = [
    {
        title: 'Market Analysis',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Data/Charts
        description: 'In-depth analysis of global trends to identify lucrative investment opportunities.',
        color: 'bg-emerald-600',
    },
    {
        title: 'Accounting Advisor',
        image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Accountant
        description: 'Expert financial management and regulatory compliance for your business.',
        color: 'bg-emerald-600',
    },
    {
        title: 'General Consultancy',
        image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Meeting
        description: 'Strategic planning and business development services tailored to your goals.',
        color: 'bg-emerald-600',
    },
    {
        title: 'Structured Assessment',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Hands/Paper
        description: 'Comprehensive risk assessment and portfolio restructuring for optimal performance.',
        color: 'bg-emerald-600',
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const Specialists = () => {
    return (
        <section className="relative z-20 -mt-24 pb-20 px-4 md:px-0 container mx-auto">
            {/* Top Text Box */}
            <motion.div
                className="bg-card shadow-xl rounded-sm p-8 md:p-12 relative border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="md:w-1/3 border-r-4 border-primary pr-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground uppercase leading-tight">
                            Financial<br />Specialists
                        </h2>
                    </div>
                    <div className="md:w-2/3">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Years of knowledge, along with care and attention brings with us the greatest results for our clients.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {/* Note: gap-6 for spacing. Shadows moved to items. */}

                {specialists.map((item, index) => (
                    <motion.div
                        key={index}
                        className="group relative overflow-hidden h-96 bg-muted cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
                        variants={itemVariants}
                    >
                        {/* Image */}
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Default Bottom Bar (Hidden on Hover) */}
                        <div className="absolute bottom-0 left-0 w-full bg-primary p-4 transition-transform duration-300 translate-y-0 group-hover:translate-y-full">
                            <h3 className="font-bold text-lg text-primary-foreground">{item.title}</h3>
                        </div>

                        {/* Hover Overlay - Half Height */}
                        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-primary/95 text-white p-6 flex flex-col justify-center items-start gap-3 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                            <h3 className="font-bold text-xl leading-tight">{item.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                                {item.description}
                            </p>
                            <button className="mt-1 border border-white px-5 py-2 rounded-full text-xs font-bold tracking-wider hover:bg-white hover:text-primary transition-colors uppercase">
                                Learn More
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default Specialists;
