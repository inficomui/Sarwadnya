import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Shree Sarwadnya All in one Solutions. Your trusted partner for financial growth and multi-services.",
};
import Navbar from '@/components/portfolio/Navbar';
import Hero from '@/components/portfolio/Hero';
import Specialists from '@/components/portfolio/Specialists';
import AboutUs from '@/components/portfolio/AboutUs';
import Services from '@/components/portfolio/Services';
import WhyChooseUs from '@/components/portfolio/WhyChooseUs';
import News from '@/components/portfolio/News';
import Footer from '@/components/portfolio/Footer';
import FAQ from '@/components/portfolio/FAQ';
import Testimonials from '@/components/portfolio/Testimonials';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Specialists />
      <AboutUs />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <News />
      <Footer />
    </main>
  );
}