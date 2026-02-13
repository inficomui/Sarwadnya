import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./sharedBaseQuery";

export interface Slider {
    id: number;
    image: string;
    title: string;
    description: string;
    link: string;
    order: number;
    status: boolean;
}

export interface GetSlidersResponse {
    status: string;
    data: Slider[];
}

export const sliderApi = createApi({
    reducerPath: "sliderApi",
    baseQuery: createBaseQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api`),
    tagTypes: ["Sliders"],
    endpoints: (builder) => ({
        getSliders: builder.query<Slider[], void>({
            query: () => "/sliders",
            transformResponse: (response: GetSlidersResponse) => response.data,
            providesTags: ["Sliders"],
        }),
        createSlider: builder.mutation<void, FormData>({
            query: (formData) => ({
                url: "/sliders",
                method: "POST",
                body: formData,
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Sliders"],
        }),
        updateSlider: builder.mutation<void, { id: number; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/sliders/${id}`,
                method: "POST", // POST with formData often used for updates in Laravel/PHP backends to handle files
                body: formData,
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Sliders"],
        }),
        deleteSlider: builder.mutation<void, number>({
            query: (id) => ({
                url: `/sliders/${id}`,
                method: "DELETE",
                headers: {
                    "X-Admin-Request": "true",
                },
            }),
            invalidatesTags: ["Sliders"],
        }),
    }),
});

export const {
    useGetSlidersQuery,
    useCreateSliderMutation,
    useUpdateSliderMutation,
    useDeleteSliderMutation,
} = sliderApi;
