"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/authSlice";

export default function AuthInitializer() {
    const dispatch = useDispatch();

    useEffect(() => {
        try {
            // Check sessionStorage first (for impersonated users), then localStorage
            let userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
            let token = sessionStorage.getItem("token") || localStorage.getItem("token");
            let tokenType = sessionStorage.getItem("tokenType") || localStorage.getItem("tokenType") || "Bearer";

            if (userStr && token) {
                const user = JSON.parse(userStr);
                dispatch(setUser({ user, access_token: token, token_type: tokenType }));

                // Log if this is an impersonated session
                if (sessionStorage.getItem("isImpersonating") === "true") {
                    console.log("[Auth] Impersonated user session detected");
                }
            }
        } catch (error) {
            console.error("Failed to initialize auth from storage", error);
        }
    }, [dispatch]);

    return null;
}
