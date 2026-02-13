"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Crown, ArrowRight, ShieldCheck } from 'lucide-react';

const plans = [
    { capital: "50,000", monthly: "5,000", total: "97,500", popular: false },
    { capital: "1,00,000", monthly: "10,000", total: "1,95,000", popular: true }, // Highlighted
    { capital: "2,00,000", monthly: "20,000", total: "3,90,000", popular: false },
    { capital: "5,00,000", monthly: "50,000", total: "9,75,000", popular: false },
    { capital: "10,00,000", monthly: "1,00,000", total: "19,00,000", popular: false },
    { capital: "20,00,000", monthly: "2,00,000", total: "38,00,000", popular: false },
];

const InvestmentPlans = () => {
    return (
        <section className="py-24 bg-background relative overflow-hidden" id="investment-plans">

            {/* --- Background Effects --- */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* --- Section Header --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Crown size={14} className="text-primary" />
                        <span className="text-primary text-xs font-bold tracking-wider uppercase">Premium Returns</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Choose Your <span className="text-primary">Wealth Path</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Standardized 20-month plans designed for maximum growth.
                        Enjoy a fixed <span className="text-foreground font-semibold">High-Yield Monthly ROI</span> with complete transparency.
                    </p>
                </motion.div>

                {/* --- Cards Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative group rounded-3xl p-1 transition-all duration-300 hover:-translate-y-2 ${plan.popular
                                ? "bg-gradient-to-b from-primary via-primary/50 to-background shadow-lg shadow-primary/10"
                                : "bg-border hover:bg-primary/20"
                                }`}
                        >
                            {/* Inner Card Content */}
                            <div className="h-full bg-card rounded-[22px] p-8 relative overflow-hidden border border-border group-hover:border-primary/30 transition-colors">

                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Header: Capital */}
                                <div className="mb-6">
                                    <p className="text-muted-foreground text-sm font-medium mb-1">Capital Investment</p>
                                    <h3 className="text-3xl font-bold text-foreground">₹{plan.capital}</h3>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-border mb-6 group-hover:bg-primary/20 transition-colors" />

                                {/* Features List */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                                                <TrendingUp size={16} />
                                            </div>
                                            <span className="text-muted-foreground text-sm">Monthly Return</span>
                                        </div>
                                        <span className="text-green-500 font-bold">₹{plan.monthly}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className="text-muted-foreground text-sm">Total ROI (20 Mo)</span>
                                        </div>
                                        <span className="text-primary font-bold">₹{plan.total}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                                                <CheckCircle size={16} />
                                            </div>
                                            <span className="text-muted-foreground text-sm">Duration</span>
                                        </div>
                                        <span className="text-foreground">20 Months</span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${plan.popular
                                    ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
                                    : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                                    }`}>
                                    Invest Now
                                    <ArrowRight size={18} />
                                </button>

                                {/* TDS Disclaimer (Small) */}
                                <p className="text-[10px] text-center text-muted-foreground mt-4">
                                    * 5% TDS applicable on profits
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-16 text-center border-t border-border pt-8"
                >
                    <p className="text-muted-foreground text-sm">
                        Looking for a custom amount? <a href="/contact" className="text-primary hover:underline">Contact our support team</a> for tailored packages above ₹20L.
                    </p>
                </motion.div>

            </div>
        </section>
    );
};

export default InvestmentPlans;

















