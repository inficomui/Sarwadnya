import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    AdminLoginRequest,
    AdminLoginResponse,
    AdminUser,
    AdminDashboardResponse,
    GetAdminTransfersResponse,
    UpdateTransferStatusRequest,
    UpdateTransferStatusResponse,
    Transfer,
    GetPayoutsByRangeResponse,
    GetPayoutsByRangeParams,
    BankDetailResponse,
    BankDetailRequest,
    GetBankDetailsResponse,
    UserLoginResponse,
    SendNotificationRequest,
} from "../../lib/types";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    
    tagTypes: ["admin", "transfers"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        // Admin Login Endpoint
        adminLogin: builder.mutation<AdminLoginResponse["data"], AdminLoginRequest>({
            query: (credentials) => ({
                url: "/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["admin"],
            transformResponse: (response: AdminLoginResponse) => {
                // Store admin data in localStorage
                if (typeof window !== "undefined" && response?.data) {
                    localStorage.setItem("adminUser", JSON.stringify(response.data.user));
                    localStorage.setItem("adminToken", response.data.access_token);
                    localStorage.setItem("adminTokenType", response.data.token_type);
                }
                return response.data;
            },
        }),

        // Admin Logout (optional - you can add this if needed)
        adminLogout: builder.mutation<void, void>({
            query: () => ({
                url: "/admin/logout",
                method: "POST",
            }),
            invalidatesTags: ["admin"],
            transformResponse: () => {
                // Clear admin data from localStorage
                if (typeof window !== "undefined") {
                    localStorage.removeItem("adminUser");
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminTokenType");
                }
            },
        }),

        // Get Admin Profile (optional - you can add this if needed)
        getAdminProfile: builder.query<AdminUser, void>({
            query: () => ({
                url: "/admin/profile",
                method: "GET",
            }),
            providesTags: ["admin"],
        }),

        // Get Admin Dashboard Data
        getAdminDashboardData: builder.query<AdminDashboardResponse["data"], void>({
            query: () => ({
                url: "/admin/dashboard",
                method: "GET",
            }),
            providesTags: ["admin"],
            transformResponse: (response: AdminDashboardResponse) => response.data,
        }),

        // Get All Transfers (optionally filter by user_id)
        getAdminTransfers: builder.query<Transfer[], { user_id?: number } | void>({
            query: (params) => ({
                url: "/admin/transfers",
                method: "GET",
                params: params || undefined,
            }),
            providesTags: ["transfers"],
            transformResponse: (response: GetAdminTransfersResponse) => response.data,
        }),

        // Get User Transfers by ID
        getAdminUserTransfers: builder.query<Transfer[], number>({
            query: (userId) => ({
                url: "/admin/transfers",
                method: "GET",
                params: { user_id: userId },
            }),
            providesTags: ["transfers"],
            transformResponse: (response: GetAdminTransfersResponse) => response.data,
        }),

        // Update Transfer Status
        updateAdminTransferStatus: builder.mutation<Transfer, UpdateTransferStatusRequest>({
            query: ({ id, status }) => ({
                url: `/admin/transfers/${id}/status`,
                method: "POST",
                body: { status },
            }),
            invalidatesTags: ["transfers"],
            transformResponse: (response: UpdateTransferStatusResponse) => response.data,
        }),

        // Admin: Get Payouts by Date Range
        getAdminPayoutsByRange: builder.query<GetPayoutsByRangeResponse, GetPayoutsByRangeParams>({
            query: (params) => ({
                url: "/admin/payouts/range",
                method: "GET",
                params: params,
            }),
            providesTags: ["admin"],
        }),

        // Update User Bank Details
        updateUserBankDetails: builder.mutation<BankDetailResponse, { id: number; data: BankDetailRequest }>({
            query: ({ id, data }) => ({
                url: `/admin/bank-details/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["admin"],
        }),

        // Admin: Get User Bank Details
        getAdminUserBankDetails: builder.query<GetBankDetailsResponse, number>({
            query: (id) => ({
                url: `/admin/users/${id}/bank-details`,
                method: "GET",
            }),
            providesTags: ["admin"],
        }),

        // Admin: Impersonate User (Login as User)
        impersonateUser: builder.mutation<UserLoginResponse, number>({
            query: (userId) => ({
                url: `/admin/users/${userId}/impersonate`,
                method: "POST",
                headers: {
                    'X-Admin-Request': 'true'
                }
            }),
            transformResponse: (response: UserLoginResponse) => {
                if (typeof window !== "undefined" && response?.data) {
                    sessionStorage.setItem("user", JSON.stringify(response.data.user));
                    sessionStorage.setItem("token", response.data.access_token);
                    sessionStorage.setItem("tokenType", response.data.token_type);
                    sessionStorage.setItem("isImpersonating", "true");
                }
                return response;
            },
        }),
        // Admin: Send Notification
        sendNotification: builder.mutation<{ status: string; message: string }, SendNotificationRequest>({
            query: (data) => ({
                url: "/admin/notifications/send",
                method: "POST",
                body: data,
            }),
        }),

        // Admin: Delete/Revoke Investment
        deleteInvestment: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/transfers/${id}/delete`,
                method: "DELETE",
            }),
            invalidatesTags: ["transfers", "admin"],
        }),
    }),
});

export const {
    useAdminLoginMutation,
    useAdminLogoutMutation,
    useGetAdminProfileQuery,
    useGetAdminDashboardDataQuery,
    useGetAdminTransfersQuery,
    useGetAdminUserTransfersQuery,
    useUpdateAdminTransferStatusMutation,
    useGetAdminPayoutsByRangeQuery,
    useUpdateUserBankDetailsMutation,
    useGetAdminUserBankDetailsQuery,
    useImpersonateUserMutation,
    useSendNotificationMutation,
    useDeleteInvestmentMutation,
} = adminApi