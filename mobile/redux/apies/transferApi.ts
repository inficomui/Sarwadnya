import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetUserTransfersResponse,
    CreateTransferResponse
} from "../../lib/types";

export const transferApi = createApi({
    reducerPath: "transferApi",
    baseQuery: createBaseQuery(),
    tagTypes: ["UserTransfers"],
    endpoints: (builder) => ({
        getMyTransfers: builder.query<GetUserTransfersResponse, void>({
            query: () => ({
                url: "/user/transfers",
                method: "GET",
            }),
            providesTags: ["UserTransfers"],
        }),
        createTransfer: builder.mutation<CreateTransferResponse, FormData>({
            query: (formData) => ({
                url: "/user/transfers",
                method: "POST",
                body: formData,
                // Do not set Content-Type header; fetch will auto-generate it with boundary
            }),
            invalidatesTags: ["UserTransfers"],
        }),
    }),
});

export const {
    useGetMyTransfersQuery,
    useCreateTransferMutation
} = transferApi;
