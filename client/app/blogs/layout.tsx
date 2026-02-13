import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";

export default function BlogsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            {/* Add padding top to account for fixed navbar */}
            <main className="flex-1 pt-24 pb-12">
                {children}
            </main>
            <Footer />
        </div>
    );
}
