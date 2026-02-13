import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-hot-toast";


const customPrepareHeaders = (headers: Headers, context: any) => {
  if (typeof window !== "undefined") {
    const { endpoint } = context;
    let token = null;
    const isAdminEndpoint =
      endpoint?.toLowerCase().includes('admin') ||
      headers.get('X-Admin-Request') === 'true';

    const publicEndpoints = [
      'loginUser',
      'registerUsers',
      'sendPasswordResetOTP',
      'verifyPasswordResetOTP',
      'resetPassword',
      'getReferralByCode'
    ];

    if (publicEndpoints.includes(endpoint)) {
      console.log('[Auth] Skipping token for public endpoint:', endpoint);
      return headers;
    }

    if (isAdminEndpoint) {
      // Use admin token for admin endpoints, fallback to user token
      token = localStorage.getItem("adminToken");
      if (!token) {
        // Check sessionStorage first (for impersonated users)
        token = sessionStorage.getItem("token");
        if (!token) {
          token = localStorage.getItem("token");
        }
        if (token) console.log('[Auth] Checking secondary token for admin endpoint');
      }
      console.log('[Auth] Using token for admin endpoint:', endpoint);
    } else {
      // Use regular user token for user endpoints
      // Check sessionStorage first (for impersonated users), then localStorage
      token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        token = localStorage.getItem("adminToken");
        if (token) console.log('[Auth] Checking secondary token for user endpoint');
      }
      console.log('[Auth] Using token for endpoint:', endpoint);
    }

    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
      console.log('[Auth] Authorization header set successfully');
    } else if (!token) {
      console.warn('[Auth] No token found for endpoint:', endpoint);
    }
  }

  return headers;
};


export const createBaseQuery = (baseUrlParam?: string) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: baseUrlParam || process.env.NEXT_PUBLIC_BACKEND_URL,
    prepareHeaders: customPrepareHeaders,
    credentials: "include",
  });

  return async (args: any, api: any, extraOptions: any) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const errorData: any = result.error.data;
      let errorMessage = "An unknown error occurred.";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (result.error.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage, { position: "top-right" });
    } else if (result.data) {
      const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();
      const data = result.data as any;

      if (data?.status === "error" || data?.status === "fail" || data?.success === false) {
        toast.error(data?.message || "Operation failed", { position: "top-right" });
        return {
          error: {
            status: "CUSTOM_ERROR",
            data: data
          }
        };
      } else if (method !== "GET") {
        const successMessage = data?.message;
        if (successMessage) {
          toast.success(successMessage, { position: "top-right", duration: 3000 });
        }
      }
    }

    return result;
  };
};