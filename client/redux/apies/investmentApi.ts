import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetInvestmentsResponse,
    GetInvestmentScheduleResponse
} from "../../lib/types/finance";

export const investmentApi = createApi({
    reducerPath: "investmentApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    
    tagTypes: ["Investments", "InvestmentSchedule"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        // User: Get All Investments
        getMyInvestments: builder.query<GetInvestmentsResponse, void>({
            query: () => ({
                url: "/user/investments",
                method: "GET",
            }),
            providesTags: ["Investments"],
        }),
        // User: Get Investment Schedule
        getInvestmentSchedule: builder.query<GetInvestmentScheduleResponse, number>({
            query: (id) => ({
                url: `/user/investments/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "InvestmentSchedule", id }],
        }),
        // Admin: Get Investment Schedule
        getAdminInvestmentSchedule: builder.query<GetInvestmentScheduleResponse, number>({
            query: (id) => ({
                url: `/admin/investments/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "InvestmentSchedule", id }],
        }),
    }),
});

export const {
    useGetMyInvestmentsQuery,
    useGetInvestmentScheduleQuery,
    useGetAdminInvestmentScheduleQuery
} = investmentApi;