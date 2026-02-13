import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    GetWalletResponse,
    WalletTopupRequest,
    WalletTopupResponse,
    WalletInvestRequest,
    WalletInvestResponse,
    GetWalletRequestsResponse,
    ApproveWalletRequest,
    AdminWalletActionResponse,
    UpdateWalletAccessRequest
} from "@/lib/types";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        // Check for both user and admin tokens
        const token = state.auth.token || state.adminAuth.adminToken;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const walletApi = createApi({
    reducerPath: "walletApi",
    baseQuery: baseQuery,
    tagTypes: ["Wallet", "AdminWalletRequests"],
    endpoints: (builder) => ({
        // USER ENDPOINTS
        getWallet: builder.query<GetWalletResponse, void>({
            query: () => "/user/wallet",
            providesTags: ["Wallet"],
        }),
        requestTopup: builder.mutation<WalletTopupResponse, WalletTopupRequest>({
            query: (data) => {
                const formData = new FormData();
                formData.append('amount', data.amount.toString());
                if (data.description) formData.append('description', data.description);
                if (data.receipt) formData.append('receipt', data.receipt);

                return {
                    url: "/user/wallet/topup",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Wallet"],
        }),
        investFromWallet: builder.mutation<WalletInvestResponse, WalletInvestRequest>({
            query: (data) => ({
                url: "/user/wallet/invest",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),
        activateReferral: builder.mutation<import("@/lib/types").ActivateReferralResponse, import("@/lib/types").ActivateReferralRequest>({
            query: (data) => ({
                url: "/user/wallet/invest",
                method: "POST",
                body: {
                    user_id: data.referral_id,
                    amount: data.amount
                },
            }),
            invalidatesTags: ["Wallet"],
        }),

        refundReferral: builder.mutation<import("@/lib/types").RefundReferralResponse, import("@/lib/types").RefundReferralRequest>({
            query: ({ investment_id }) => ({
                url: "/user/wallet/refund-referral",
                method: "POST",
                body: { investment_id },
            }),
            invalidatesTags: ["Wallet"],
            transformErrorResponse: (response: { status: number; data: any }) => {
                if (response.status === 404) {
                    return {
                        status: 'error',
                        message: 'API Endpoint missing. Backend developer needs to implement: POST /api/user/wallet/refund-referral'
                    };
                }
                return response.data;
            }
        }),

        // ADMIN ENDPOINTS
        getPendingWalletRequests: builder.query<GetWalletRequestsResponse, { page?: number; per_page?: number; search?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params) {
                    if (params.page) queryParams.append('page', params.page.toString());
                    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
                    if (params.search) queryParams.append('search', params.search);
                }
                return `/admin/wallet-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            },
            providesTags: ["AdminWalletRequests"],
        }),
        processWalletRequest: builder.mutation<AdminWalletActionResponse, ApproveWalletRequest>({
            query: ({ id, action }) => ({
                url: `/admin/wallet-requests/${id}/approve`,
                method: "POST",
                body: { action },
            }),
            invalidatesTags: ["AdminWalletRequests"],
        }),
        updateWalletAccess: builder.mutation<AdminWalletActionResponse, UpdateWalletAccessRequest>({
            query: ({ id, is_wallet_active }) => ({
                url: `/admin/users/${id}/wallet-access`,
                method: "PUT",
                body: { is_wallet_active },
            }),
            // Invalidate user details/list might be needed here depending on where the flag is shown
        }),
        adminTopupUserWallet: builder.mutation<import("@/lib/types").AdminWalletTopupResponse, import("@/lib/types").AdminWalletTopupRequest>({
            query: ({ user_id, amount, description }) => ({
                url: `/admin/users/${user_id}/wallet/topup`,
                method: "POST",
                body: { amount, description },
            }),
            invalidatesTags: ["Wallet"],
            transformErrorResponse: (response: { status: number; data: any }) => {
                if (response.status === 404) {
                    return {
                        status: 'error',
                        message: 'API Endpoint missing. Backend developer needs to implement: POST /api/admin/users/{id}/wallet/topup'
                    };
                }
                return response.data;
            }
        }),
        adminDeductUserWallet: builder.mutation<import("@/lib/types").AdminWalletTopupResponse, import("@/lib/types").AdminWalletTopupRequest>({
            query: ({ user_id, amount, description }) => ({
                url: `/admin/users/${user_id}/wallet/deduct`,
                method: "POST",
                body: { amount, description },
            }),
            invalidatesTags: ["Wallet"],
            transformErrorResponse: (response: { status: number; data: any }) => {
                if (response.status === 404) {
                    return {
                        status: 'error',
                        message: 'API Endpoint missing. Backend developer needs to implement: POST /api/admin/users/{id}/wallet/deduct'
                    };
                }
                return response.data;
            }
        }),
    }),
});

export const {
    useGetWalletQuery,
    useRequestTopupMutation,
    useInvestFromWalletMutation,
    useGetPendingWalletRequestsQuery,
    useProcessWalletRequestMutation,
    useUpdateWalletAccessMutation,
    useAdminTopupUserWalletMutation,
    useAdminDeductUserWalletMutation,
    useActivateReferralMutation,
    useRefundReferralMutation,
} = walletApi;
