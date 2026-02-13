import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type { TreeSummaryResponse, TreeUsersResponse, GetTreeUsersParams, TreeInvestmentSummaryResponse } from "../../lib/types";

export const treeApi = createApi({
    reducerPath: "treeApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Tree"],
    endpoints: (builder) => ({
        getTreeSummary: builder.query<TreeSummaryResponse, void>({
            query: () => ({
                url: "/user/tree-summary",
                method: "GET",
            }),
            providesTags: ["Tree"],
        }),
        getTreeInvestmentSummary: builder.query<TreeInvestmentSummaryResponse, void>({
            query: () => ({
                url: "/user/tree/investment-summary",
                method: "GET",
            }),
            providesTags: ["Tree"],
        }),
        getTreeUsers: builder.query<TreeUsersResponse, GetTreeUsersParams>({
            query: ({ level, page = 1, per_page = 10 }) => ({
                url: `/user/tree/${level}`,
                method: "GET",
                params: { page, per_page },
            }),
            providesTags: (result, error, { level }) => [{ type: "Tree", id: `LEVEL_${level}` }],
        }),
    }),
});

export const { useGetTreeSummaryQuery, useGetTreeUsersQuery, useGetTreeInvestmentSummaryQuery } = treeApi;
