// src/hooks/useAuth.ts
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/redux/store";
import {
    useLoginUserMutation,
    useRegisterUsersMutation,
    useLogoutUserMutation,
} from "@/redux/apies/authApi";
import { setUser, logout as logoutAction } from "@/redux/slices/authSlice";
import type { LoginRequest, UserRegisterRequest } from "@/lib/types";

/**
 * Custom hook for user authentication
 * Provides easy access to auth state and methods
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    // Select from 'auth' slice now
    const { user, token, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const [loginUserMutation, { isLoading: isLoggingIn, error: loginError }] =
        useLoginUserMutation();
    const [
        registerUsersMutation,
        { isLoading: isRegistering, error: registerError },
    ] = useRegisterUsersMutation();
    const [logoutUserMutation, { isLoading: isLoggingOut }] =
        useLogoutUserMutation();

    /**
     * Login user with email/phone and password
     */
    const login = async (credentials: LoginRequest) => {
        try {
            const result = await loginUserMutation(credentials).unwrap();
            // Dispatch/Storage handled by API matcher and transformResponse in authApi/authSlice
            // But we can dispatch if we want to be explicit, though authSlice matchers handle it.
            // dispatch(setUser(result)); 
            return { success: true, data: result };
        } catch (error: any) {
            return {
                success: false,
                error: error?.data?.message || "Login failed",
            };
        }
    };

    /**
     * Register new user
     */
    const register = async (userData: UserRegisterRequest) => {
        try {
            const result = await registerUsersMutation(userData).unwrap();
            // Dispatch/Storage handled by API matcher
            return { success: true, data: result };
        } catch (error: any) {
            return {
                success: false,
                error: error?.data?.message || "Registration failed",
            };
        }
    };

    /**
     * Logout user and redirect to login page
     */
    const logout = async (redirectTo: string = "/login") => {
        try {
            await logoutUserMutation().unwrap();
            dispatch(logoutAction());
            router.replace(redirectTo);
            return { success: true };
        } catch (error: any) {
            // Even if API call fails, clear local state
            dispatch(logoutAction());
            router.replace(redirectTo);
            return {
                success: false,
                error: error?.data?.message || "Logout failed",
            };
        }
    };

    /**
     * Check if user is authenticated and redirect if not
     */
    const requireAuth = (redirectTo: string = "/login") => {
        if (!isAuthenticated) {
            router.push(redirectTo);
            return false;
        }
        return true;
    };

    /**
     * Redirect if user is already authenticated
     */
    const requireGuest = (redirectTo: string = "/") => {
        if (isAuthenticated) {
            router.push(redirectTo);
            return false;
        }
        return true;
    };

    return {
        // State
        user,
        token,
        isAuthenticated,

        // Loading states
        isLoggingIn,
        isRegistering,
        isLoggingOut,

        // Errors
        loginError,
        registerError,

        // Methods
        login,
        register,
        logout,
        requireAuth,
        requireGuest,
    };
};
