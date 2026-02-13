"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    breadcrumbs: { label: string; href: string }[];
    backgroundImage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, backgroundImage }) => {
    return (
        <section className="relative h-100 md:h-[600px] w-full overflow-hidden flex items-center justify-center pt-24">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('${backgroundImage || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"}')`
                }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
                    <p className="text-lg text-gray-200 mb-6">Would you like to come by and say hi?</p>

                    <nav className="flex justify-center items-center text-sm md:text-base font-medium space-x-2">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <span className="text-primary px-2">/</span>}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-primary">{crumb.label}</span>
                                ) : (
                                    <Link href={crumb.href} className="hover:text-primary transition-colors">
                                        {crumb.label}
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                </motion.div>
            </div>
        </section>
    );
};

export default PageHeader;
