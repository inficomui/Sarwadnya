import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/redux/store";
import {
    useAdminLoginMutation,
    useAdminLogoutMutation,
} from "@/redux/apies/adminApi";
import { logoutAdmin } from "@/redux/slices/adminSlice";
import { logout as logoutUser } from "@/redux/slices/authSlice";

/**
 * Custom hook for admin authentication
 */
export const useAdminAuth = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { adminUser, adminToken } = useSelector(
        (state: RootState) => state.adminAuth
    );

    const [adminLoginMutation, { isLoading: isLoggingIn, error: loginError }] =
        useAdminLoginMutation();
    const [adminLogoutMutation, { isLoading: isLoggingOut }] =
        useAdminLogoutMutation();

    const isAuthenticated = !!adminToken;

    const login = async (credentials: any) => {
        try {
            const result = await adminLoginMutation(credentials).unwrap();
            return { success: true, data: result };
        } catch (error: any) {
            return {
                success: false,
                error: error?.data?.message || "Login failed",
            };
        }
    };

    const logout = async (redirectTo: string = "/admin/login") => {
        try {
            await adminLogoutMutation().unwrap();
            dispatch(logoutAdmin());
            dispatch(logoutUser());
            router.replace(redirectTo);
            return { success: true };
        } catch (error: any) {
            dispatch(logoutAdmin());
            dispatch(logoutUser());
            router.replace(redirectTo);
            return {
                success: false,
                error: error?.data?.message || "Logout failed",
            };
        }
    };

    return {
        adminUser,
        adminToken,
        isAuthenticated,
        isLoggingIn,
        isLoggingOut,
        loginError,
        login,
        logout
    };
};
