// src/redux/apies/authApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  UpdateDeviceTokenRequest,
  UpdateDeviceTokenResponse
} from "../../lib/types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    // LOGIN
    loginUser: builder.mutation<UserLoginResponse["data"], LoginRequest>({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["auth"],
      async onQueryStarted(args, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            // Store in AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.access_token);
            await AsyncStorage.setItem("tokenType", data.token_type);

            // Immediately update Redux state
            const { setCredentials } = await import('../slices/authSlice');
            dispatch(setCredentials({ user: data.user, token: data.access_token }));
          }
        } catch (error) {
          console.error("Login failed on storage", error);
        }
      },
      transformResponse: (response: UserLoginResponse) => response.data,
    }),

    // REGISTER
    registerUsers: builder.mutation<UserRegisterResponse["data"], UserRegisterRequest>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["auth"],
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Check if response contains token data (auto-login scenario)
          if (data && data.access_token) {
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.access_token);
            await AsyncStorage.setItem("tokenType", data.token_type);
          }
        } catch (error) {
          console.error("Registration storage failed", error);
        }
      },
      transformResponse: (response: UserRegisterResponse) => response.data,
    }),

    // LOGOUT
    logoutUser: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["auth"],
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("tokenType");
        } catch (error) {
          console.error("Logout cleanup failed", error);
          // Force cleanup even on error
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("tokenType");
        }
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

    // NOTIFICATIONS
    updateDeviceToken: builder.mutation<UpdateDeviceTokenResponse, UpdateDeviceTokenRequest>({
      query: (data) => ({
        url: "/user/device-token",
        method: "POST",
        body: data,
      }),
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
  useUpdateDeviceTokenMutation,
} = authApi;
