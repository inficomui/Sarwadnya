import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    GetWalletResponse,
    WalletTopupRequest,
    WalletTopupResponse,
    WalletInvestRequest,
    WalletInvestResponse,
    ActivateReferralResponse,
    ActivateReferralRequest,
    RefundReferralResponse,
    RefundReferralRequest,
    GetWalletParams
} from "../../lib/types";

export const walletApi = createApi({
    reducerPath: "walletApi",
    baseQuery: createBaseQuery(),
    tagTypes: ["Wallet"],
    endpoints: (builder) => ({
        // USER ENDPOINTS
        getWallet: builder.query<GetWalletResponse, GetWalletParams | void>({
            query: (params) => ({
                url: "/user/wallet",
                params: params || {},
            }),
            providesTags: ["Wallet"],
        }),
        requestTopup: builder.mutation<WalletTopupResponse, WalletTopupRequest>({
            query: (data) => {
                const formData = new FormData();
                formData.append('amount', data.amount.toString());
                if (data.description) formData.append('description', data.description);
                if (data.receipt) {
                    // Start of workaround for React Native FormData file upload
                    const file = {
                        uri: data.receipt.uri,
                        name: data.receipt.name || 'receipt.jpg',
                        type: data.receipt.type || 'image/jpeg',
                    } as any;
                    formData.append('receipt', file);
                }

                return {
                    url: "/user/wallet/topup",
                    method: "POST",
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                };
            },
            invalidatesTags: ["Wallet"],
        }),
        investFromWallet: builder.mutation<WalletInvestResponse, WalletInvestRequest>({
            query: (data) => ({
                url: "/user/wallet/invest",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),
        activateReferral: builder.mutation<ActivateReferralResponse, ActivateReferralRequest>({
            query: (data) => ({
                url: "/user/wallet/invest",
                method: "POST",
                body: {
                    user_id: data.referral_id,
                    amount: data.amount
                },
            }),
            invalidatesTags: ["Wallet"],
        }),
        refundReferral: builder.mutation<RefundReferralResponse, RefundReferralRequest>({
            query: ({ investment_id }) => ({
                url: "/user/wallet/refund-referral",
                method: "POST",
                body: { investment_id },
            }),
            invalidatesTags: ["Wallet"],
        }),
    }),
});

export const {
    useGetWalletQuery,
    useRequestTopupMutation,
    useInvestFromWalletMutation,
    useActivateReferralMutation,
    useRefundReferralMutation,
} = walletApi;
