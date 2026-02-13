import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type { GetPayoutsResponse, GetPayoutsParams, GetPayoutsByRangeResponse, GetPayoutsByRangeParams } from "../../lib/types";

export const payoutApi = createApi({
    reducerPath: "payoutApi",
    baseQuery: createBaseQuery(),
    tagTypes: ["Payouts"],
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
    }),
});

export const {
    useGetMyPayoutsQuery,
    useGetPayoutsByRangeQuery
} = payoutApi;
