import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const customPrepareHeaders = async (headers: Headers, context: any) => {
  const { endpoint, getState } = context;
  let token = null;

  try {
    // 1. Attempt to get token from Redux state (fastest and sync)
    const state = getState() as any; // Using any to avoid circular dependency issues with RootState
    token = state.auth?.token;

    if (token) console.log('[Auth] Using token from Redux state');
  } catch (e) {
    console.warn('[Auth] Could not read from Redux state', e);
  }

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

  try {
    if (isAdminEndpoint) {
      // Use admin token for admin endpoints, fallback to user token
      const adminToken = await AsyncStorage.getItem("adminToken");
      if (adminToken) {
        token = adminToken;
      } else if (!token) {
        token = await AsyncStorage.getItem("token");
        if (token) console.log('[Auth] Using fallback token for admin endpoint');
      }
      console.log('[Auth] Admin endpoint:', endpoint, 'Token present:', !!token);
    } else {
      // Use regular user token for user endpoints
      if (!token) {
        token = await AsyncStorage.getItem("token");
        if (token) console.log('[Auth] Retained token from Storage');
      }

      if (!token) {
        token = await AsyncStorage.getItem("adminToken");
        if (token) console.log('[Auth] Using fallback token for user endpoint');
      }
      console.log('[Auth] User endpoint:', endpoint, 'Token present:', !!token);
    }

    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
      console.log('[Auth] Authorization header set for:', endpoint);
    } else if (!token) {
      console.warn('[Auth] ⚠️ No token found for endpoint:', endpoint);
    }
  } catch (error) {
    console.error('[Auth] ❌ Error retrieving token:', error);
  }

  return headers;
};

export const createBaseQuery = (baseUrlParam?: string) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: baseUrlParam || 'https://api.sarwadnyafinance.com/api',
    prepareHeaders: customPrepareHeaders,
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

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    } else if (result.data) {
      const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();
      const data = result.data as any;

      if (data?.status === "error" || data?.status === "fail" || data?.success === false) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data?.message || "Operation failed",
          position: 'top',
          visibilityTime: 4000,
        });
        return {
          error: {
            status: "CUSTOM_ERROR",
            data: data
          }
        };
      } else if (method !== "GET") {
        const successMessage = data?.message;
        if (successMessage) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: successMessage,
            position: 'top',
            visibilityTime: 3000,
          });
        }
      }
    }

    return result;
  };
};
