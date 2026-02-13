import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import { Blog, BlogResponse, PaginatedResponse } from "../../lib/types";

export const blogApi = createApi({
    reducerPath: "blogApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Blogs"],
    endpoints: (builder) => ({
        getBlogs: builder.query<PaginatedResponse<Blog>, { page?: number }>({
            query: ({ page = 1 }) => `/blogs?page=${page}`,
            providesTags: ["Blogs"],
        }),
        getBlogBySlug: builder.query<BlogResponse, string>({
            query: (slug) => `/blogs/${slug}`,
            providesTags: (result, error, slug) => [{ type: "Blogs", id: slug }],
        }),
        createBlog: builder.mutation<BlogResponse, FormData>({
            query: (formData) => ({
                url: "/blogs",
                method: "POST",
                body: formData,
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Blogs"],
        }),
        updateBlog: builder.mutation<BlogResponse, { id: number; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/blogs/${id}`,
                method: "POST",
                body: formData,
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Blogs"],
        }),
        deleteBlog: builder.mutation<{ status: string }, number>({
            query: (id) => ({
                url: `/blogs/${id}`,
                method: "DELETE",
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Blogs"],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogBySlugQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogApi;
