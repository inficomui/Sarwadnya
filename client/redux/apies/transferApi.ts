import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetUserTransfersResponse,
    CreateTransferRequest,
    CreateTransferResponse
} from "../../lib/types";

export const transferApi = createApi({
    reducerPath: "transferApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["UserTransfers"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        getMyTransfers: builder.query<GetUserTransfersResponse, void>({
            query: () => ({
                url: "/user/transfers",
                method: "GET",
            }),
            providesTags: ["UserTransfers"],
        }),
        createTransfer: builder.mutation<CreateTransferResponse, FormData>({
            query: (data) => ({
                url: "/user/transfers",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["UserTransfers"],
        }),
    }),
});

export const {
    useGetMyTransfersQuery,
    useCreateTransferMutation
} = transferApi;
