"use client";
import React from 'react';
import Link from 'next/link';
import { Globe, ShieldCheck, TrendingUp, Building2, Briefcase } from 'lucide-react';

const newsItems = [
    {
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "21, JAN 2026", // Updated date
        title: "Market Trends: The Evaluation of Smart Spending",
        excerpt: "Analyzing the latest shifts in consumer behavior and investment strategies that are shaping the future of personal finance..."
    },
    {
        image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "10, JAN 2026",
        title: "Global Investment Opportunities for the Year Ahead",
        excerpt: "Experts predict a rise in emerging market sectors. Discover where smart money is moving in the coming quarters..."
    },
    {
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "28, DEC 2025",
        title: "Sustainable Finance: A New Era of Growth",
        excerpt: "How eco-friendly investment portfolios are outperforming traditional assets and why you should care..."
    },
];

import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const News = () => {
    return (
        <section id="news" className="py-20 bg-background border-t border-border scroll-mt-28">
            <div className="container mx-auto px-4 text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Latest News</h4>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground uppercase">Our Financial Updates</h2>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 md:px-10">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {newsItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col text-left group"
                            variants={itemVariants}
                        >
                            <div className="overflow-hidden rounded-sm mb-6 h-60">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <span className="text-muted-foreground text-xs font-semibold uppercase mb-2">{item.date}</span>
                            <Link href="/blogs" className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-4 line-clamp-2">
                                {item.title}
                            </Link>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                                {item.excerpt}
                            </p>
                            <Link href="/blogs" className="text-primary hover:text-primary/80 text-sm font-bold uppercase tracking-widest inline-block mt-auto">
                                Read More
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Partners Strip */}
            <div className="container mx-auto px-4 mt-24">
                <motion.div
                    className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    {[
                        { name: "GlobalInvest", Icon: Globe, sub: "Group" },
                        { name: "SecureBank", Icon: ShieldCheck, sub: "Ltd" },
                        { name: "TradeMaster", Icon: TrendingUp, sub: "Finance" },
                        { name: "UrbanEstate", Icon: Building2, sub: "Realty" },
                        { name: "CorpVision", Icon: Briefcase, sub: "Solutions" },
                    ].map((partner, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-pointer transition-all duration-300 hover:transform hover:scale-105">
                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                <partner.Icon size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-none">
                                    {partner.name}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                                    {partner.sub}
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default News;
