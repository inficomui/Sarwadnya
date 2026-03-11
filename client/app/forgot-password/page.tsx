import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/portfolio/Navbar';
import Footer from '@/components/portfolio/Footer';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
    title: "Forgot Password",
    description: "Reset your password for your account at Shree Sarwadnya All in one Solutions.",
};

export default function ForgotPasswordPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="grow pb-20 px-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gray-900/5 rounded-full blur-[100px]" />
                </div>
                <div className="relative z-10 w-full">
                    <ForgotPasswordForm />
                </div>
            </div>
            <Footer />
        </main>
    );
}


export const revalidate = 3600;
