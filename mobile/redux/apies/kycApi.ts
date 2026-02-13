import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetKycFieldsResponse,
    GetKycStatusResponse,
    SubmitKycResponse,
    KycSubmission,
    KycField
} from "../../lib/types";

export const kycApi = createApi({
    reducerPath: "kycApi",
    baseQuery: createBaseQuery(),
    tagTypes: ["KycFields", "KycStatus"],
    endpoints: (builder) => ({
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
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
    }),
});

export const {
    useGetUserKycFieldsQuery,
    useSubmitUserKycMutation,
    useCheckUserKycStatusQuery,
} = kycApi;
