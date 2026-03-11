import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetWithdrawalsResponse,
    GetWithdrawalsParams,
    GetWithdrawalDetailsResponse,
    UpdateWithdrawalStatusRequest,
    UpdateWithdrawalStatusResponse
} from "../../lib/types_withdrawals";

export const withdrawalApi = createApi({
    reducerPath: "withdrawalApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Withdrawals"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        // User: List Withdrawals
        getMineWithdrawals: builder.query<GetWithdrawalsResponse, GetWithdrawalsParams | void>({
            query: (params) => ({
                url: "/user/withdrawals",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Withdrawals"],
        }),

        // User: Get Withdrawal Details
        getMineWithdrawalDetails: builder.query<GetWithdrawalDetailsResponse, number>({
            query: (id) => ({
                url: `/user/withdrawals/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Withdrawals", id }],
        }),

        // Admin: List Withdrawals
        getAdminWithdrawals: builder.query<GetWithdrawalsResponse, GetWithdrawalsParams | void>({
            query: (params) => ({
                url: "/admin/withdrawals",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Withdrawals"],
        }),

        // Admin: Get Withdrawal Details
        getAdminWithdrawalDetails: builder.query<GetWithdrawalDetailsResponse, number>({
            query: (id) => ({
                url: `/admin/withdrawals/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Withdrawals", id }],
        }),

        // Admin: Update Status
        updateWithdrawalStatus: builder.mutation<UpdateWithdrawalStatusResponse, UpdateWithdrawalStatusRequest>({
            query: ({ id, ...body }) => ({
                url: `/admin/withdrawals/${id}/status`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                "Withdrawals",
                { type: "Withdrawals", id }
            ],
        }),

        // Admin: Export Withdrawals CSV
        exportWithdrawals: builder.mutation<{ blob: Blob; contentType: string | null }, string>({
            query: (token) => ({
                url: "/admin/withdrawals/export",
                method: "GET",
                params: { token },
                responseHandler: async (response: Response) => ({
                    blob: await response.blob(),
                    contentType: response.headers.get("content-type"),
                }),
            }),
        }),
    }),
});

export const {
    useGetMineWithdrawalsQuery,
    useGetMineWithdrawalDetailsQuery,
    useGetAdminWithdrawalsQuery,
    useGetAdminWithdrawalDetailsQuery,
    useUpdateWithdrawalStatusMutation,
    useExportWithdrawalsMutation,
} = withdrawalApi;
