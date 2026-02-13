"use client";
import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
    return (
        <section id="about" className="py-20 bg-background scroll-mt-28">
            <div className="container mx-auto px-4 md:px-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">About Us</h4>
                        <h2 className="text-4xl font-bold text-foreground mb-8">WHO WE ARE</h2>

                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            We are Shree Sarwadnya All in one Solutions. We provide consultation from 5 years.
                        </p>

                        <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                            Our mission is to empower individuals and businesses with trusted financial strategies, innovative investment plans, and comprehensive operational support. We believe in transparency, integrity, and long-term growth for all our partners.
                        </p>

                        <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                            With a dedicated team of experts in finance, market analysis, and business consulting, we help you navigate complex landscapes to achieve your financial goals with confidence.
                        </p>
                    </motion.div>
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Our Team"
                                className="w-full object-cover h-[600px] rounded-sm shadow-lg"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
