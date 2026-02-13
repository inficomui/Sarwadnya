"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <div className="flex flex-col items-center max-w-md w-full space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <h1 className="relative text-9xl font-extrabold text-primary/10 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">Page Not Found</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-muted-foreground text-lg">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link href="/" className="w-full sm:w-auto" tabIndex={-1}>
                        <Button variant="default" as="div" className="w-full gap-2 h-12 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all cursor-pointer">
                            <Home size={18} />
                            Go Home
                        </Button>
                    </Link>
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="w-full sm:w-auto gap-2 h-12 text-base font-semibold shadow-sm transition-all"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
