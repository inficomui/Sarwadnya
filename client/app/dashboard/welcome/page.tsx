"use client";

import React, { useRef } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserDashboardQuery } from '@/redux/apies/dashboardApi';
import { userSidebarItems } from '@/lib/userSidebarItems';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function WelcomeLetterPage() {
    const { user, logout, isLoggingOut } = useAuth();
    const { data: dashboardData, isLoading } = useGetUserDashboardQuery();
    const printRef = useRef<HTMLDivElement>(null);

    const profile = dashboardData?.data?.profile;
    const account = dashboardData?.data?.account;
    const referral = dashboardData?.data?.referral;

    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownload = async () => {
        const printContent = printRef.current;
        if (!printContent) return;

        setIsDownloading(true);

        try {
            // Wait for images to load (optional but good practice)
            await new Promise(resolve => setTimeout(resolve, 500));

            const dataUrl = await toPng(printContent, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                quality: 1.0,
                pixelRatio: 2, // High resolution
                style: {
                    transform: 'none', // Reset any framer motion scaling
                    margin: '0',
                    display: 'block' // Ensure flex/other display issues don't affect capture
                }
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = 210;
            const pdfHeight = 297;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Welcome_Letter_${profile?.name || 'Sarwadnya'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <DashboardLayout
                    sidebarItems={userSidebarItems}
                    user={user ? { ...user, role: 'user' } : undefined}
                    onLogout={logout}
                    isLoggingOut={isLoggingOut}
                >
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout
                sidebarItems={userSidebarItems}
                user={user ? { ...user, role: 'user' } : undefined}
                onLogout={logout}
                isLoggingOut={isLoggingOut}
            >
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
                `}</style>
                <div className="space-y-6 max-w-5xl mx-auto pb-12">
                    {/* Controls */}
                    <div className="flex justify-between items-center print:hidden bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Letter</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">View and download your official membership letter</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                {isDownloading ? 'Generating...' : 'Download PDF'}
                            </Button>
                        </div>
                    </div>

                    {/* The Letter - A4 Aspect Ratio Container */}
                    <div className="flex justify-center bg-slate-100 dark:bg-slate-900 py-8 overflow-hidden rounded-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white w-[210mm] min-h-[297mm] relative shadow-2xl mx-auto text-slate-900 print:w-full print:shadow-none print:m-0"
                            ref={printRef}
                        >
                            {/* Decorative Border */}
                            <div className="absolute inset-0 border-[12px] border-double border-orange-100 m-3 pointer-events-none z-20"></div>

                            {/* Header Stripe */}
                            <div className="bg-[#FCA311] text-white py-8 px-8 md:px-12 print:bg-yellow-500">
                                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                                    <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 bg-white rounded-full p-2 overflow-hidden shadow-lg border-4 border-orange-200/50">
                                        <Image
                                            src="/sarwadnya-nav-logo.png"
                                            alt="Shree Sarwadnya Logo"
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-wide uppercase text-center md:text-left drop-shadow-sm leading-tight max-w-2xl">
                                        Shree Sarwadnya <span className="block text-lg md:text-2xl font-sans font-medium tracking-widest mt-1 opacity-90">All in one solutions</span>
                                    </h1>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                                <div className="w-[500px] h-[500px] rounded-full bg-orange-500/[0.03] blur-3xl transform -translate-y-12"></div>
                                <h1 className="absolute text-[80px] md:text-[100px] font-bold text-slate-900/[0.02] transform -rotate-45 select-none font-serif text-center leading-tight">SHREE SARWADNYA</h1>
                            </div>

                            <div className="px-12 py-6 relative z-10 flex flex-col h-full min-h-[900px]">
                                <div>
                                    {/* Certificate Meta Details (Date & ID) */}
                                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-tight">Date of Issue</p>
                                                <p className="font-semibold text-sm text-slate-800">{formatDate(new Date().toISOString())}</p>
                                            </div>
                                        </div>

                                        {referral?.code && (
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-tight">Member ID</p>
                                                    <p className="font-mono font-bold text-lg text-orange-600">{referral.code}</p>
                                                </div>
                                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Details Card */}
                                    <div className="transform hover:scale-[1.01] transition-transform duration-300 relative rounded-xl overflow-hidden mb-6 border border-slate-200 shadow-sm bg-white">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FCA311]"></div>
                                        <div className="p-6">
                                            <h3 className="text-orange-900 font-bold uppercase tracking-wider mb-4 pb-2 text-xs flex items-center gap-2">
                                                <span className="w-8 h-px bg-orange-300"></span> Member Details <span className="flex-1 h-px bg-orange-100"></span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Name</p>
                                                    <p className="font-serif text-base font-semibold text-slate-800 capitalize">{profile?.name || user?.name}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Member ID</p>
                                                    <p className="font-mono text-base font-medium text-slate-700">{referral?.code || "N/A"}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mobile</p>
                                                    <p className="text-sm text-slate-700">{profile?.phone_number || user?.phone_number}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Email</p>
                                                    <p className="text-sm text-slate-700">{profile?.email || user?.email}</p>
                                                </div>
                                                <div className="space-y-0.5 md:col-span-2">
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Joined Date</p>
                                                    <p className="text-sm text-slate-700">{formatDate(account?.joined_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Text */}
                                    <div className="space-y-4 text-slate-700 leading-relaxed mb-4 text-sm md:text-base">
                                        <h2 className="text-xl font-serif text-slate-900">
                                            Welcome to <span className="text-[#FCA311] font-bold">Shree Sarwadnya All in one solutions</span>
                                        </h2>
                                        <p>
                                            We are thrilled to welcome you as a distinguished member of our growing family. Your decision to join <strong>Shree Sarwadnya</strong> reflects your trust in our vision for financial empowerment and holistic growth.
                                        </p>
                                        <p>
                                            At Shree Sarwadnya, we are steadfast in our commitment to transparency, security, and delivering exceptional value. We have designed our ecosystem to support your aspirations and ensure a prosperous journey ahead.
                                        </p>
                                        <div className="py-2">
                                            <p className="text-xs text-slate-500 italic bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                <span className="font-semibold text-amber-700">Note:</span> Your account is now active. You can access your full portfolio and services by logging into <a href="https://shreesarwadnya.com/" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline decoration-dotted underline-offset-4">shreesarwadnya.com</a> with your credentials.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>

                                    <div className="mt-8 mb-12"> {/* Margin bottom ensures space for absolute footer */}
                                        <h2 className="text-xl font-serif text-slate-800 italic text-center mb-6 opacity-80">"Wish You All The Best!"</h2>

                                        <div className="flex justify-end px-4">
                                            <div className="text-center w-56 relative">
                                                {/* Digital Signature Stamp Effect */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-28 opacity-10 pointer-events-none">
                                                    <div className="w-full h-full border-4 border-slate-900 rounded-full flex items-center justify-center p-2">
                                                        <div className="w-full h-full border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-center">
                                                            Digitally<br />Signed
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-16 mb-2 relative flex items-end justify-center z-10">
                                                    <div className="font-script text-3xl text-slate-800" style={{ fontFamily: 'cursive' }}>Shree Sarwadnya</div>
                                                </div>
                                                <div className="w-full h-px bg-slate-400 mb-2"></div>
                                                <p className="font-bold text-slate-900 text-sm">Shree Sarwadnya<br />All in one solutions</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">Authorized Signatory</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="text-center pt-2 border-t border-slate-100 mb-8 pb-4">
                                        <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">
                                            Computer Generated Document &bull; No Physical Signature Required
                                        </p>
                                        <p className="text-[10px] text-slate-300">
                                            Shree Sarwadnya All in one solutions &copy; {new Date().getFullYear()}. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom colored bar */}
                            <div className="bg-[#FCA311] h-4 w-full absolute bottom-0 left-0 print:bg-yellow-500"></div>
                        </motion.div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
