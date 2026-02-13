
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Register",
    description: "Create an account at Shree Sarwadnya All in one Solutions to start your journey towards financial freedom.",
};
import Navbar from '@/components/portfolio/Navbar';
import Footer from '@/components/portfolio/Footer';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="grow pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gray-900/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 w-full">
                    <React.Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Loading...</div>}>
                        <SignUpForm />
                    </React.Suspense>
                </div>
            </div>
            <Footer />
        </main>
    );
}
