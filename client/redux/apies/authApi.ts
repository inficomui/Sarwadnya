// src/api/authApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
  LoginRequest,
  LogoutResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserLoginResponse,
  UserRegisterResponse,
  UserRegisterRequest,
  User,
} from "../../lib/types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
  
    tagTypes: ["auth"],
    keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    // LOGIN
    loginUser: builder.mutation<UserLoginResponse["data"], LoginRequest>({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["auth"],
      transformResponse: (response: UserLoginResponse) => {
        const result = response.data;
        if (typeof window !== "undefined" && result) {
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("token", result.access_token);
          localStorage.setItem("tokenType", result.token_type);
        }
        return result;
      },
    }),

    // REGISTER
    registerUsers: builder.mutation<UserRegisterResponse["data"], UserRegisterRequest>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["auth"],
      transformResponse: (response: UserRegisterResponse) => {
        // Auto-login on register if needed, or just return data
        if (typeof window !== "undefined" && response?.data) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("token", response.data.access_token);
          localStorage.setItem("tokenType", response.data.token_type);
        }
        return response.data;
      },
    }),

    // LOGOUT
    logoutUser: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["auth"],
      transformResponse: (data: LogoutResponse) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("tokenType");
        }
        return data;
      },
    }),

    // GET PROFILE
    getUserProfile: builder.query<User, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),
      providesTags: ["auth"],
      transformResponse: (response: { status: string; data: User }) => {
        console.log('Profile API Response:', response);
        return response.data;
      },
    }),

    // UPDATE PROFILE
    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: "/user/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["auth"],
      transformResponse: (response: { status: string; message: string; data: User }) => {
        console.log('Update Profile API Response:', response);
        return response.data;
      },
    }),

    // FORGOT PASSWORD
    sendPasswordResetOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (data) => ({
        url: "/auth/forgot-password/send-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyPasswordResetOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: "/auth/forgot-password/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: "/auth/forgot-password/reset",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    // SEARCH REFERRAL
    getReferralByCode: builder.query<{ name: string; referral_code: string }, string>({
      query: (code) => ({
        url: `/search-referral/${code}`,
        method: "GET",
      }),
      transformResponse: (response: { status: string; data: { name: string; referral_code: string } }) => response.data,
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUsersMutation,
  useLogoutUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useSendPasswordResetOTPMutation,
  useVerifyPasswordResetOTPMutation,
  useResetPasswordMutation,
  useLazyGetReferralByCodeQuery,
} = authApi;