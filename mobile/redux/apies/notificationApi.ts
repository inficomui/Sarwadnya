import { createApi } from "@reduxjs/toolkit/query/react";
import type { GetNotificationsParams, NotificationResponse } from "../../lib/types";
import { createBaseQuery } from "./sharedBaseQuery";

export const notificationApi = createApi({
    reducerPath: "notificationApi",
    baseQuery: createBaseQuery(),
    tagTypes: ["Notifications"],
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationResponse, GetNotificationsParams>({
            query: ({ page = 1, per_page = 20 }) => ({
                url: "/user/notifications",
                method: "GET",
                params: { page, per_page },
            }),
            providesTags: ["Notifications"],
        }),
        markAsRead: builder.mutation<{ status: string; message: string }, string>({
            query: (id) => ({
                url: `/user/notifications/${id}/read`,
                method: "PUT",
            }),
            invalidatesTags: ["Notifications"],
        }),
        markAllAsRead: builder.mutation<{ status: string; message: string }, void>({
            query: () => ({
                url: "/user/notifications/read-all",
                method: "PUT",
            }),
            invalidatesTags: ["Notifications"],
        }),
        deleteNotification: builder.mutation<{ status: string; message: string }, string>({
            query: (id) => ({
                url: `/user/notifications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notifications"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation
} = notificationApi;
