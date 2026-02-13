"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Linkedin, Briefcase } from 'lucide-react';
import LOGO from '@/public/sarwadnya-nav-logo.png';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-background pt-20 border-t border-border">
      <motion.div
        className="container mx-auto px-4 md:px-10 pb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Desc */}
          <div>
            <Link href="/" className="block mb-6">
              <div className="relative w-44 h-14 md:w-52 md:h-20">
                <Image
                  src={LOGO}
                  alt="Shree Sarwadnya All in one Solutions & Multi Services"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Shree Sarwadnya All in one Solutions: Empowering your growth with a unified platform for strategic financial planning, expert multi-services, and industry-leading wealth management.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-foreground font-bold uppercase mb-6 text-sm">Our Services</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#services" className="hover:text-primary transition-colors">Financial Advisory</Link></li>
              <li><Link href="#services" className="hover:text-primary transition-colors">Business Audit</Link></li>
              <li><Link href="#services" className="hover:text-primary transition-colors">Consultancy</Link></li>
              <li><Link href="#services" className="hover:text-primary transition-colors">Risk Assurance</Link></li>
              <li><Link href="#services" className="hover:text-primary transition-colors">Mutual Funds</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-bold uppercase mb-6 text-sm">Quick Links</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#testimonial" className="hover:text-primary transition-colors">Testimonial</Link></li>
              <li><Link href="#news" className="hover:text-primary transition-colors">Expert</Link></li>
              <li><Link href="#contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-foreground font-bold uppercase mb-6 text-sm">Get In Touch</h4>
            <ul className="space-y-4 text-sm text-muted-foreground mb-8">
              <li>T-21/4, Opposite to ExpertGlobal,<br />Next to Ambuja cement, Software Technology Park of India(STPI),<br />MIDC, Aurangabad-431006.</li>
              <li>
                Phone: <a href="tel:+919270543819" className="hover:text-primary">+91 92705 43819</a><br />
                Email: <a href="mailto:sarwadnyaallinonesolutions@gmail.com" className="hover:text-primary">sarwadnyaallinonesolutions@gmail.com</a>
              </li>
            </ul>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Copyright Bar */}
      <div className="border-t border-border py-6">
        <div className="container mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Shree Sarwadnya All in one Solutions. All Rights Reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;