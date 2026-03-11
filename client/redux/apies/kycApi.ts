import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetKycFieldsResponse,
    CreateKycFieldRequest,
    UpdateKycFieldRequest,
    GetKycStatusResponse,
    SubmitKycResponse,
    GetKycSubmissionsResponse,
    UpdateKycStatusRequest,
    UpdateKycStatusResponse,
    KycSubmission,
    KycField
} from "../../lib/types";

export const kycApi = createApi({
    reducerPath: "kycApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["KycFields", "KycStatus", "KycSubmissions"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        getAdminKycFields: builder.query<KycField[], void>({
            query: () => ({
                url: "/admin/kyc/fields",
                method: "GET",
            }),
            providesTags: ["KycFields"],
            transformResponse: (response: GetKycFieldsResponse) => response.data,
        }),
        addAdminKycField: builder.mutation<void, CreateKycFieldRequest>({
            query: (body) => ({
                url: "/admin/kyc/fields",
                method: "POST",
                body,
            }),
            invalidatesTags: ["KycFields"],
        }),
        updateAdminKycField: builder.mutation<void, UpdateKycFieldRequest>({
            query: ({ id, ...body }) => ({
                url: `/admin/kyc/fields/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["KycFields"],
        }),
        deleteAdminKycField: builder.mutation<void, number>({
            query: (id) => ({
                url: `/admin/kyc/fields/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["KycFields"],
        }),
        getUserKycFields: builder.query<KycField[], void>({
            query: () => ({
                url: "/user/kyc/fields",
                method: "GET",
            }),
            providesTags: ["KycFields"],
            transformResponse: (response: GetKycFieldsResponse) => response.data,
        }),
        submitUserKyc: builder.mutation<SubmitKycResponse, FormData>({
            query: (formData) => ({
                url: "/user/kyc/submit",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["KycStatus"],
        }),
        checkUserKycStatus: builder.query<GetKycStatusResponse["data"], void>({
            query: () => ({
                url: "/user/kyc/status",
                method: "GET",
            }),
            providesTags: ["KycStatus"],
            transformResponse: (response: GetKycStatusResponse) => response.data,
        }),


        getAdminKycSubmissions: builder.query<KycSubmission[], void>({
            query: () => ({
                url: "/admin/kyc/submissions",
                method: "GET",
            }),
            providesTags: ["KycSubmissions"],
            transformResponse: (response: GetKycSubmissionsResponse) => response.data,
        }),
        updateAdminKycStatus: builder.mutation<KycSubmission, UpdateKycStatusRequest>({
            query: ({ id, ...body }) => ({
                url: `/admin/kyc/submissions/${id}/status`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["KycSubmissions", "KycStatus"],
            transformResponse: (response: UpdateKycStatusResponse) => response.data,
        }),
    }),
});

export const {
    useGetAdminKycFieldsQuery,
    useAddAdminKycFieldMutation,
    useUpdateAdminKycFieldMutation,
    useDeleteAdminKycFieldMutation,
    useGetUserKycFieldsQuery,
    useSubmitUserKycMutation,
    useCheckUserKycStatusQuery,
    useGetAdminKycSubmissionsQuery,
    useUpdateAdminKycStatusMutation,
} = kycApi;
