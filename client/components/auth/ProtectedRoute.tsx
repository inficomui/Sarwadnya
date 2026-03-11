"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuthenticatedInRedux = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [mounted, setMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(isAuthenticatedInRedux);
    const [isLoading, setIsLoading] = useState(!isAuthenticatedInRedux);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticatedInRedux) {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
            } else {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        } else {
            setIsAuthenticated(true);
            setIsLoading(false);
        }
    }, [router, isAuthenticatedInRedux]);

    // Don't render anything on the server to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    if (isLoading && !isAuthenticatedInRedux) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; 
    }

    return <>{children}</>;
}
