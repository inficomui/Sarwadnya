"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogoutMutation } from "@/redux/apies/adminApi";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminSidebarItems } from "@/lib/adminSidebarItems";
import type { AdminUser } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAdminCredentials, logoutAdmin } from "@/redux/slices/adminSlice";
import { logout } from "@/redux/slices/authSlice";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [adminLogout, { isLoading: isAdminLoggingOut }] = useAdminLogoutMutation();
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if admin is logged in
        if (typeof window !== "undefined") {
            const adminUserStr = localStorage.getItem("adminUser");
            const adminToken = localStorage.getItem("adminToken");

            if (!adminToken || !adminUserStr) {
                router.push("/admin/login");
                return;
            }

            try {
                const user = JSON.parse(adminUserStr);
                setAdminUser(user);
                dispatch(setAdminCredentials({ user, token: adminToken }));
            } catch (error) {
                console.error("Error parsing admin user data:", error);
                router.push("/admin/login");
            } finally {
                setIsLoading(false);
            }
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            // Attempt to logout from server
            await adminLogout().unwrap();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Completely logout user and admin locally regardless of server response

            // Clear Admin Auth
            dispatch(logoutAdmin());

            // Clear User Auth (as requested to completely logout user too)
            dispatch(logout());

            // Manually clear storage just to be double sure (though slices should handle it)
            if (typeof window !== "undefined") {
                localStorage.removeItem("adminUser");
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminTokenType");

                // Clear user storage too
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("tokenType");
            }

            router.replace("/admin/login");
            router.refresh();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="text-foreground text-xl font-medium">Checking authentication...</div>
                </div>
            </div>
        );
    }

    if (!adminUser) return null;

    return (
        <DashboardLayout
            sidebarItems={adminSidebarItems}
            user={{ ...adminUser, role: 'admin' }} // Spread full adminUser to pass id (and name, email)
            onLogout={handleLogout}
            isLoggingOut={isAdminLoggingOut}
        >
            {children}
        </DashboardLayout>
    );
}
