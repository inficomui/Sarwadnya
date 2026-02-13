import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    CreateDepositRequest,
    CreateDepositResponse,
    GetDepositsResponse,
    GetAllDepositsResponse,
    UpdateDepositStatusRequest,
    UpdateDepositStatusResponse,
    Deposit
} from "../../lib/types";

export const depositApi = createApi({
    reducerPath: "depositApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["UserDeposits", "AdminDeposits"],
    endpoints: (builder) => ({
        // User: Create Deposit Request
        createDeposit: builder.mutation<CreateDepositResponse, FormData>({
            query: (formData) => ({
                url: "/user/deposits",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["UserDeposits"],
        }),

        // User: Get My Deposits
        getMyDeposits: builder.query<GetDepositsResponse, void>({
            query: () => ({
                url: "/user/deposits",
                method: "GET",
            }),
            providesTags: ["UserDeposits"],
        }),

        // Admin: Get All Deposits
        getAllAdminDeposits: builder.query<Deposit[], { user_id?: number } | void>({
            query: (params) => ({
                url: "/admin/deposits",
                method: "GET",
                params: params || undefined,
            }),
            providesTags: ["AdminDeposits"],
            transformResponse: (response: GetAllDepositsResponse) => response.data,
        }),

        // Admin: Get User Deposits by ID
        getAdminUserDeposits: builder.query<Deposit[], number>({
            query: (userId) => ({
                url: "/admin/deposits",
                method: "GET",
                params: { user_id: userId },
            }),
            providesTags: ["AdminDeposits"],
            transformResponse: (response: GetAllDepositsResponse) => response.data,
        }),

        // Admin: Update Deposit Status
        updateAdminDepositStatus: builder.mutation<Deposit, UpdateDepositStatusRequest>({
            query: ({ id, status }) => ({
                url: `/admin/deposits/${id}/status`,
                method: "POST",
                body: { status },
            }),
            invalidatesTags: ["AdminDeposits", "UserDeposits"],
            transformResponse: (response: UpdateDepositStatusResponse) => response.data,
        }),
    }),
});

export const {
    useCreateDepositMutation,
    useGetMyDepositsQuery,
    useGetAllAdminDepositsQuery,
    useGetAdminUserDepositsQuery,
    useUpdateAdminDepositStatusMutation
} = depositApi;
