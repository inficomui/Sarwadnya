import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type { 
    GetPayoutsResponse, 
    GetPayoutsParams, 
    GetPayoutsByRangeResponse, 
    GetPayoutsByRangeParams, 
    MaturePayoutRequest, 
    MaturePayoutResponse,
    GetWeeklyReportResponse,
    GetWeeklyReportParams,
    GetBonusHistoryResponse
} from "../../lib/types";

export const payoutApi = createApi({
    reducerPath: "payoutApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Payouts"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        // User: Get Earnings Summary & History
        getMyPayouts: builder.query<GetPayoutsResponse, GetPayoutsParams | void>({
            query: (params) => ({
                url: "/user/payouts",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Payouts"],
        }),

        // User: Get Payouts by Date Range
        getPayoutsByRange: builder.query<GetPayoutsByRangeResponse, GetPayoutsByRangeParams>({
            query: (params) => ({
                url: "/user/payouts/range",
                method: "GET",
                params: params,
            }),
            providesTags: ["Payouts"],
        }),
        
        // User: Get Weekly Payout Report (Cycle-wise)
        getWeeklyReport: builder.query<GetWeeklyReportResponse, GetWeeklyReportParams | void>({
            query: (params) => ({
                url: "/user/payouts/weekly-report",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Payouts"],
        }),

        // User: Get Bonus History
        getBonusHistory: builder.query<GetBonusHistoryResponse, void>({
            query: () => ({
                url: "/user/payouts/bonus-history",
                method: "GET",
            }),
            providesTags: ["Payouts"],
        }),

        // Admin: Mature Payout
        maturePayout: builder.mutation<MaturePayoutResponse, MaturePayoutRequest>({
            query: ({ id }) => ({
                url: `/admin/payouts/${id}/mature`,
                method: "POST",
            }),
            invalidatesTags: ["Payouts"],
        }),
    }),
});

export const {
    useGetMyPayoutsQuery,
    useGetPayoutsByRangeQuery,
    useGetWeeklyReportQuery,
    useGetBonusHistoryQuery,
    useMaturePayoutMutation
} = payoutApi;
