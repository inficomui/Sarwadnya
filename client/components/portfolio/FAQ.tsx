"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, MessageCircle } from 'lucide-react'; // Added MessageCircle

const faqs = [
    {
        question: "WHAT IS A BUSINESS LOAN?",
        answer: "A business loan is a sum of money derived from a formal loan arrangement between a business and a financial institution to pay for business-related expenses."
    },
    {
        question: "WILL BUSINESS LOANS ALLOW PRE-CLOSURE?",
        answer: "Yes, most business loans allow pre-closure, but it may come with a prepayment penalty depending on the bank's terms and conditions."
    },
    {
        question: "WHAT ARE THE MOST COMMON FUNDING OPERATIONS?",
        answer: "Common funding operations include equity financing, debt financing (loans), crowdfunding, and venture capital investments."
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-12 relative overflow-hidden bg-muted/50">
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23888888' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="lg:w-1/2 relative w-full hidden lg:block">
                        <div className="relative h-[500px] w-full">
                            <div className="absolute top-0 bottom-4 -left-4 right-10 bg-primary/10 rounded-3xl -z-10 transform -rotate-1" />
                            <div className="absolute top-10 bottom-0 left-4 -right-4 bg-primary/5 rounded-3xl -z-10 transform rotate-1" />

                            <div className="grid grid-cols-12 grid-rows-12 gap-3 h-full">
                                <div className="col-span-8 row-span-12 relative z-10">
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6 }}
                                        viewport={{ once: true }}
                                        className="h-full w-full rounded-xl overflow-hidden shadow-xl border-4 border-background"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=500&auto=format&fit=crop&q=60"
                                            alt="Business Professional"
                                            className="object-cover h-full w-full"
                                        />
                                    </motion.div>
                                </div>

                                <div className="col-span-5 row-span-5 col-start-8 row-start-2 relative z-20">
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        viewport={{ once: true }}
                                        className="h-full w-full rounded-xl overflow-hidden shadow-xl border-4 border-background"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                            alt="Growth"
                                            className="object-cover h-full w-full"
                                        />
                                    </motion.div>
                                    <div className="absolute -bottom-4 -right-4 lg:bottom-0 lg:right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl -z-10"></div>
                                </div>

                                <div className="col-span-4 row-span-3 col-start-9 row-start-8 relative z-30">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6, delay: 0.4 }}
                                        viewport={{ once: true }}
                                        className="bg-primary p-4 rounded-xl shadow-lg h-full flex items-center justify-center text-primary-foreground"
                                    >
                                        <div className="text-center">
                                            <span className="block text-2xl font-bold">25+</span>
                                            <span className="text-[10px] uppercase tracking-wider opacity-90">Years Exp.</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="lg:w-1/2 w-full pt-4 relative">
                        {/* --- NEW: Decorative Floating Element --- */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 right-0 lg:-right-10 text-primary/10 z-0"
                        >
                            <MessageCircle size={120} fill="currentColor" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-12 h-1 bg-primary rounded-full"></span>
                                <h4 className="text-primary font-bold uppercase tracking-widest text-xs">
                                    FAQ
                                </h4>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                                Frequently Asked <br /> Questions
                            </h2>

                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`rounded-lg overflow-hidden transition-all duration-300 border ${activeIndex === index
                                            ? 'bg-card shadow-xl border-primary scale-[1.02]'
                                            : 'bg-card/60 shadow-sm hover:shadow-md border-transparent hover:border-primary/20'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleAccordion(index)}
                                            className="w-full px-6 py-4 text-left flex justify-between items-center group"
                                        >
                                            <span className={`font-bold text-sm md:text-base transition-colors ${activeIndex === index ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                                }`}>
                                                {faq.question}
                                            </span>
                                            <span className={`transform transition-transform duration-300 bg-muted p-1.5 rounded-full ${activeIndex === index
                                                ? 'rotate-180 text-primary-foreground bg-primary'
                                                : 'text-primary group-hover:bg-primary/10'
                                                }`}>
                                                {activeIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                                            </span>
                                        </button>
                                        <AnimatePresence>
                                            {activeIndex === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 inline-flex items-center gap-3 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-primary/10 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                                    <HelpCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-foreground font-medium text-sm">Have more questions?</p>
                                    <span className="text-primary font-bold cursor-pointer hover:underline text-xs uppercase tracking-wide">
                                        Contact Support Team
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;