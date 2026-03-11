import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import type {
    User,
    PaginatedResponse,
    GetUsersParams,
    UserRegisterRequest,
} from "../../lib/types";

export const usersCrudApi = createApi({
    reducerPath: "usersCrudApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Users"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        getUsers: builder.query<PaginatedResponse<User>, GetUsersParams>({
            query: (params) => ({
                url: "/users",
                method: "GET",
                headers: { "X-Admin-Request": "true" },
                params,
            }),
            providesTags: ["Users"],
        }),
        createUser: builder.mutation<void, UserRegisterRequest>({
            query: (userData) => ({
                url: "/users",
                method: "POST",
                headers: { "X-Admin-Request": "true" },
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),
        getUser: builder.query<User, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: "GET",
                headers: { "X-Admin-Request": "true" },
            }),
            transformResponse: (response: { data: User }) => response.data,
            providesTags: (result, error, id) => [{ type: "Users", id }],
        }),
        updateUser: builder.mutation<void, { id: number; data: Partial<User> }>({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: "PUT",
                headers: { "X-Admin-Request": "true" },
                body: data,
            }),
            invalidatesTags: ["Users"],
        }),
        deleteUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
                headers: { "X-Admin-Request": "true" },
            }),
            invalidatesTags: ["Users"],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useGetUserQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersCrudApi;
