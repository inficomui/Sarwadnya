import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Terms & Conditions",
    description: "Read the terms and conditions for using the services provided by Shree Sarwadnya All in one Solutions.",
};
import Navbar from '@/components/portfolio/Navbar';
import Footer from '@/components/portfolio/Footer';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsAndConditions() {
    const lastUpdated = "January 21, 2026";

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-10 max-w-4xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600 mb-4">
                            Terms & Conditions
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
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
                                        1. Introduction
                                    </h2>
                                    <p>
                                        Welcome to Shree Sarwadnya All in one Solutions ("Company", "we", "our", "us"). By accessing or using our website, services, and mobile applications (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our Services.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        2. Use of Services
                                    </h2>
                                    <p>
                                        You agree to use our Services only for lawful purposes and in accordance with these Terms. You are responsible for identifying and authenticating all instructions and transactions sent to you via the Service.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>You must be at least 18 years old to use our Services.</li>
                                        <li>You agree not to engage in any activity that interferes with or disrupts the Services.</li>
                                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        3. User Accounts & Registration
                                    </h2>
                                    <p>
                                        To access certain features of the Services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        4. Intellectual Property
                                    </h2>
                                    <p>
                                        The Services and their original content, features, and functionality are and will remain the exclusive property of Shree Sarwadnya All in one Solutions and its licensors. The Services are protected by copyright, trademark, and other laws of India and foreign countries.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        5. Financial Disclaimer
                                    </h2>
                                    <p>
                                        The information provided through our Services is for informational purposes only and does not constitute financial, investment, or legal advice. You should consult with a qualified professional before making any financial decisions. We are not responsible for any financial losses or damages resulting from your use of the information provided.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        6. Limitation of Liability
                                    </h2>
                                    <p>
                                        In no event shall Shree Sarwadnya All in one Solutions, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        7. Changes to Terms
                                    </h2>
                                    <p>
                                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                        8. Contact Us
                                    </h2>
                                    <p>
                                        If you have any questions about these Terms, please contact us at:
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
