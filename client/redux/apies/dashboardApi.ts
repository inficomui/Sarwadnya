import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type { UserDashboardResponse } from "../../lib/types";

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getUserDashboard: builder.query<UserDashboardResponse, void>({
            query: () => ({
                url: "/user/dashboard",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
    }),
});

export const { useGetUserDashboardQuery } = dashboardApi;
