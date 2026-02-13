"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Linkedin, Twitter, Mail } from 'lucide-react';

// --- Types ---
interface TeamMember {
    name: string;
    role: string;
    image: string;
    socials?: {
        linkedin?: string;
        twitter?: string;
        email?: string;
    };
}

// --- Data ---
const teamMembers: TeamMember[] = [
    {
        name: "Yashoda Gadhave",
        role: "Managing Director",
        image: "https://ui-avatars.com/api/?name=Yashoda+Gadhave&background=0D8ABC&color=fff&size=500",
        socials: {
            linkedin: "#",
            twitter: "#",
            email: "mailto:example@gmail.com"
        }
    },
    {
        name: "Satish Patil",
        role: "Financial Coach",
        image: "https://ui-avatars.com/api/?name=Satish+Patil&background=0D8ABC&color=fff&size=500",
        socials: {
            linkedin: "#",
            email: "mailto:example@gmail.com"
        }
    }
];

// --- Animations ---
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

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 40, damping: 15 }
    }
};

const socialButtonVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 }
};

const Team = () => {
    return (
        <section className="relative py-24 bg-background overflow-hidden">
            {/* Subtle Background Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        Our Expertise
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                        Meet The <span className="text-primary">Advisors</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                        Guiding your financial journey with experience and integrity.
                    </p>
                </motion.div>

                {/* Team Grid */}
                <motion.div
                    className="flex flex-wrap justify-center gap-10"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover={{ y: -10 }} // The "Lift" Effect
                            className="group relative w-full max-w-[340px] bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 dark:bg-zinc-900/80 dark:border dark:border-zinc-800"
                        >
                            {/* Image Area */}
                            <div className="relative h-[380px] w-full overflow-hidden">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />

                                {/* Gradient Overlay (For Text Readability if needed) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Social Icons (Appear on Hover) */}
                                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                    {/* Background Blur Box for Icons */}
                                    <div className="flex gap-3 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {member.socials?.linkedin && (
                                            <SocialLink href={member.socials.linkedin} icon={<Linkedin size={18} />} />
                                        )}
                                        {member.socials?.twitter && (
                                            <SocialLink href={member.socials.twitter} icon={<Twitter size={18} />} />
                                        )}
                                        {member.socials?.email && (
                                            <SocialLink href={member.socials.email} icon={<Mail size={18} />} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Text Content Area */}
                            <div className="relative p-6 bg-card dark:bg-zinc-900 z-10 text-center border-t border-border/50">
                                <h3 className="text-xl font-bold text-primary transition-colors duration-300">
                                    {member.name}
                                </h3>
                                <p className="text-sm font-medium text-white uppercase tracking-wider mt-1 mb-2">
                                    {member.role}
                                </p>

                                {/* Animated Bottom Bar */}
                                <div className="absolute bottom-0 left-0 h-[4px] w-full bg-muted overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-r from-primary via-purple-500 to-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// Extracted Social Link Component
const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a
        href={href}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
    >
        {icon}
    </a>
);

export default Team;