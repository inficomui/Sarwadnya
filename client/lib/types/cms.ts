// CMS TYPES (Blog, Testimonial, etc.)

export interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    video: string | null;
    status: string;
    created_at: string;
    updated_at?: string;
}

export interface BlogResponse {
    status: string;
    data: Blog;
}

export interface Testimonial {
    id: number;
    name: string;
    designation: string | null;
    company: string | null;
    content: string;
    rating: number;
    avatar: string | null;
    status: number; // 1 for active, 0 for inactive
    created_at: string;
    updated_at?: string;
}

export interface TestimonialResponse {
    status: string;
    data: Testimonial;
}

export interface TestimonialsResponse {
    status: string;
    data: Testimonial[];
}
