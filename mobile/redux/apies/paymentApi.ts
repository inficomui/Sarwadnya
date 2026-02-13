import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetPaymentDetailsResponse,
    UpdatePaymentDetailsRequest,
    UpdatePaymentDetailsResponse,
    GetBankDetailsResponse,
    BankDetailRequest,
    BankDetailResponse
} from "../../lib/types";

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: createBaseQuery(),
    tagTypes: ["PaymentDetails", "BankDetails"],
    endpoints: (builder) => ({
        // Public: Get Payment Details (Admin set)
        getPaymentDetails: builder.query<GetPaymentDetailsResponse, void>({
            query: () => ({
                url: "/payment-details",
                method: "GET",
            }),
            providesTags: ["PaymentDetails"],
        }),

        // User: Get Bank Details
        getBankDetails: builder.query<GetBankDetailsResponse, void>({
            query: () => ({
                url: "/user/bank-details",
                method: "GET",
            }),
            providesTags: ["BankDetails"],
        }),

        // User: Add Bank Detail
        addBankDetail: builder.mutation<BankDetailResponse, BankDetailRequest>({
            query: (data) => ({
                url: "/user/bank-details",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["BankDetails"],
        }),

        // User: Update Bank Detail
        updateBankDetail: builder.mutation<BankDetailResponse, { id: number; data: BankDetailRequest }>({
            query: ({ id, data }) => ({
                url: `/user/bank-details/${id}`,
                method: "PUT", // API said PUT/PATCH, assuming PUT or we can try PATCH
                body: data,
            }),
            invalidatesTags: ["BankDetails"],
        }),

        // User: Delete Bank Detail
        deleteBankDetail: builder.mutation<{ status: string; message: string }, number>({
            query: (id) => ({
                url: `/user/bank-details/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BankDetails"],
        }),

        // Admin: Update Payment Details (Note the 'admin' in name to trigger admin auth)
        updateAdminPaymentDetails: builder.mutation<UpdatePaymentDetailsResponse, UpdatePaymentDetailsRequest>({
            query: (data) => ({
                url: "/admin/payment-details",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PaymentDetails"],
        }),

        // Admin: Get Bank Details List (Assuming multiple or wrapping single)
        getAdminBankDetails: builder.query<GetPaymentDetailsResponse, void>({
            query: () => ({
                url: "/admin/bank-details", // Trying new endpoint or fallback to payment-details
                method: "GET",
            }),
            providesTags: ["PaymentDetails"],
        }),

        // Admin: Add Bank Detail
        addAdminBankDetail: builder.mutation<any, any>({
            query: (data) => ({
                url: "/admin/bank-details",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PaymentDetails"],
        }),

        // Admin: Delete Bank Detail
        deleteAdminBankDetail: builder.mutation<any, number>({
            query: (id) => ({
                url: `/admin/bank-details/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PaymentDetails"],
        }),
    }),
});

export const {
    useGetPaymentDetailsQuery,
    useLazyGetPaymentDetailsQuery,
    useUpdateAdminPaymentDetailsMutation,
    useGetBankDetailsQuery,
    useAddBankDetailMutation,
    useUpdateBankDetailMutation,
    useDeleteBankDetailMutation,
    useGetAdminBankDetailsQuery,
    useAddAdminBankDetailMutation,
    useDeleteAdminBankDetailMutation
} = paymentApi;
