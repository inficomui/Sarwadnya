import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Learn how Shree Sarwadnya All in one Solutions collects, uses, and protects your personal data.",
};
import Navbar from '@/components/portfolio/Navbar';
import Footer from '@/components/portfolio/Footer';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PrivacyPolicy() {
    const lastUpdated = "January 21, 2026";

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-10 max-w-4xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-10">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        1. Introduction
                                    </h2>
                                    <p>
                                        Shree Sarwadnya All in one Solutions ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site").
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        2. Collection of Information
                                    </h2>
                                    <p>
                                        We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <strong className="text-foreground">Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
                                        </li>
                                        <li>
                                            <strong className="text-foreground">Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                                        </li>
                                        <li>
                                            <strong className="text-foreground">Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.
                                        </li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        3. Use of Your Information
                                    </h2>
                                    <p>
                                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Administer sweepstakes, promotions, and contests.</li>
                                        <li>Assist law enforcement and respond to subpoena.</li>
                                        <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                                        <li>Create and manage your account.</li>
                                        <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
                                        <li>Email you regarding your account or order.</li>
                                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        4. Disclosure of Your Information
                                    </h2>
                                    <p>
                                        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <strong className="text-foreground">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                                        </li>
                                        <li>
                                            <strong className="text-foreground">Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                                        </li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        5. Security of Your Information
                                    </h2>
                                    <p>
                                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        6. Policy for Children
                                    </h2>
                                    <p>
                                        We do not knowingly solicit information from or market to children under the age of 13. If you become aware that any data we have collected is from children under age 13, please contact us using the contact information provided below.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        7. Contact Us
                                    </h2>
                                    <p>
                                        If you have questions or comments about this Privacy Policy, please contact us at:
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg mt-2">
                                        <p className="font-medium text-foreground">Shree Sarwadnya All in one Solutions</p>
                                        <p>T-21/4, Opposite to ExpertGlobal,</p>
                                        <p>Next to Ambuja cement, Software Technology Park of India(STPI),</p>
                                        <p>MIDC, Aurangabad-431006.</p>
                                        <p className="mt-2">Email: <a href="mailto:sarwadnyaallinonesolutions@gmail.com" className="text-primary hover:underline">sarwadnyaallinonesolutions@gmail.com</a></p>
                                        <p>Phone: <a href="tel:+919270543819" className="text-primary hover:underline">+91 92705 43819</a></p>
                                    </div>
                                </section>

                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}


export const revalidate = 3600;
