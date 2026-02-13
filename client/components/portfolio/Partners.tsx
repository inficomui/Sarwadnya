"use client";
import React from 'react';
import { motion } from 'framer-motion';

const Partners = () => {
    // Placeholder logic for partners strip as seen in News.tsx but isolated
    return (
        <div className="py-12 border-t border-border bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    className="flex flex-wrap justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 gap-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Simulated Partner Logos */}
                    <span className="text-xl font-bold font-mono text-muted-foreground/60">Build Archi<span className="text-xs align-top">LTD</span></span>
                    <span className="text-xl font-bold font-sans text-muted-foreground/60">GREEN <span className="font-light">CONSULTANT</span></span>
                    <span className="text-xl font-bold font-serif text-muted-foreground/60 flex items-center gap-1"><span className="text-2xl">⚡</span> INDI Group</span>
                    <span className="text-xl font-bold font-sans text-muted-foreground/60">JET <span className="text-muted-foreground/40">Industry</span></span>
                    <span className="text-xl font-bold font-mono text-muted-foreground/60">KBC <span className="text-muted-foreground/40">Industrial</span></span>
                </motion.div>
            </div>
        </div>
    );
};

export default Partners;
