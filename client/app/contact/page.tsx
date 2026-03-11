
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with Shree Sarwadnya All in one Solutions for financial consultation and support.",
};
import Navbar from '@/components/portfolio/Navbar';
import Footer from '@/components/portfolio/Footer';
import Contact from '@/components/portfolio/Contact';
import PageHeader from '@/components/portfolio/PageHeader';
import Partners from '@/components/portfolio/Partners';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <PageHeader
                title="Contact Shree Sarwadnya All in one Solutions"
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Contact Us', href: '/contact' }
                ]}
                backgroundImage="https://images.unsplash.com/photo-1542435503-956c469947f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            />

            <Contact />

            {/* Map Section */}
            <div className="w-full h-96 bg-gray-200">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1647563835738!5m2!1sen!2sbd"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>

            <Partners />

            <Footer />
        </main>
    );
}


export const revalidate = 3600;
