import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import NextTopLoader from 'nextjs-toploader';
import { TooltipProvider } from "@/components/ui/tooltip";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URI || 'https://shreesarwadnya.com'),
  title: {
    default: "Shree Sarwadnya All in one Solutions",
    template: "%s | Shree Sarwadnya All in one Solutions"
  },
  description: "Empowering your growth with strategic financial planning, expert multi-services, and industry-leading wealth management.",
  keywords: ["Finance", "Investment", "Multi-services", "Sarwadnya", "Wealth Management", "All in one solutions"],
  authors: [{ name: "Shree Sarwadnya" }],
  creator: "Shree Sarwadnya",
  publisher: "Shree Sarwadnya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/sarwadnya-nav-logo.png",
    shortcut: "/sarwadnya-nav-logo.png",
    apple: "/sarwadnya-nav-logo.png",
  },
  openGraph: {
    title: "Shree Sarwadnya All in one Solutions",
    description: "Your trusted partner for finance and multi-services.",
    url: 'https://shreesarwadnya.com',
    siteName: 'Shree Sarwadnya All in one Solutions',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shree Sarwadnya All in one Solutions',
    description: 'Your trusted partner for finance and multi-services.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${inter.variable} antialiased`}>
        <NextTopLoader color="#C5A059" />
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} containerStyle={{ zIndex: 99999 }} />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}