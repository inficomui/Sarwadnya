import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";
import { Testimonial, TestimonialResponse, TestimonialsResponse } from "../../lib/types";

export const testimonialApi = createApi({
    reducerPath: "testimonialApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    
    tagTypes: ["Testimonials"],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        getTestimonials: builder.query<TestimonialsResponse, void>({
            query: () => ({
                url: "/testimonials",
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            providesTags: ["Testimonials"],
        }),
        getTestimonialById: builder.query<TestimonialResponse, number>({
            query: (id) => `/testimonials/${id}`,
            providesTags: (result, error, id) => [{ type: "Testimonials", id }],
        }),
        createTestimonial: builder.mutation<TestimonialResponse, FormData>({
            query: (formData) => ({
                url: "/testimonials",
                method: "POST",
                body: formData,
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Testimonials"],
        }),
        submitTestimonial: builder.mutation<TestimonialResponse, FormData>({
            query: (formData) => ({
                url: "/testimonials",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Testimonials"],
        }),
        updateTestimonial: builder.mutation<TestimonialResponse, { id: number; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/testimonials/${id}`,
                method: "POST",
                body: formData,
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Testimonials"],
        }),
        deleteTestimonial: builder.mutation<{ status: string }, number>({
            query: (id) => ({
                url: `/testimonials/${id}`,
                method: "DELETE",
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Testimonials"],
        }),
    }),
});

export const {
    useGetTestimonialsQuery,
    useGetTestimonialByIdQuery,
    useCreateTestimonialMutation,
    useSubmitTestimonialMutation,
    useUpdateTestimonialMutation,
    useDeleteTestimonialMutation,
} = testimonialApi;
