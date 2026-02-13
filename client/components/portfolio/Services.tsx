"use client";
import React from 'react';
import { BarChart, Users, CreditCard, Award } from 'lucide-react';

const services = [
    {
        icon: BarChart,
        title: "Investment Management",
        description: "Secure high returns with our fixed ROI plans tailored for your financial growth."
    },
    {
        icon: CreditCard,
        title: "Forex & Currency",
        description: "Expert currency exchange and forex trading services to diversify your portfolio."
    },
    {
        icon: Users,
        title: "Share Market",
        description: "Strategic trading in equities focusing on consistent growth and risk management."
    },
    {
        icon: Award,
        title: "Affiliate Program",
        description: "Earn attractive commissions through our multi-level referral program."
    }
];

import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5 }
    }
};


const Services = () => {
    return (
        <section id="services" className="py-20 bg-muted/30 scroll-mt-28">
            <div className="container mx-auto px-4 md:px-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Content */}
                    <div className="lg:w-1/2 px-4 md:px-10 lg:pr-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Our Services</h4>
                            <h2 className="text-4xl font-bold text-foreground mb-12">WHAT WE DO</h2>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    className="flex flex-col items-start"
                                    variants={itemVariants}
                                >
                                    <div className="bg-primary rounded-full p-3 mb-4 text-primary-foreground">
                                        <service.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right Image */}
                    <motion.div
                        className="lg:w-1/2 mt-12 lg:mt-0 relative min-h-[500px]"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="absolute inset-0">
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Team Working"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Services;
