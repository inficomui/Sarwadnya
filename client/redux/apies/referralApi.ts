import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type { ReferralDashboardSummaryResponse, ReferralEarningsHistoryResponse, GetReferralEarningsParams } from "../../lib/types";

export const referralApi = createApi({
    reducerPath: "referralApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    
    tagTypes: ["Referrals"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        // User: Get Referral Dashboard Summary
        getReferralDashboardSummary: builder.query<ReferralDashboardSummaryResponse, void>({
            query: () => ({
                url: "/user/referrals/dashboard",
                method: "GET",
            }),
            providesTags: ["Referrals"],
        }),
        // User: Get Referral Earnings History
        getReferralEarningsHistory: builder.query<ReferralEarningsHistoryResponse, GetReferralEarningsParams | void>({
            query: (params) => ({
                url: "/user/referrals/earnings",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Referrals"],
        }),
    }),
});

export const {
    useGetReferralDashboardSummaryQuery,
    useGetReferralEarningsHistoryQuery,
} = referralApi;
