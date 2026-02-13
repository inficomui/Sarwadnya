import { MetadataRoute } from 'next'

// Since we're using static export, we'll generate this at build time
export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URI || 'https://shreesarwadnya.com';
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.sarwadnyafinance.com';

interface Blog {
    slug: string;
    updated_at?: string;
    created_at?: string;
}

interface PaginatedResponse<T> {
    data: {
        data: T[];
        last_page: number;
    }
}

async function getAllBlogs(): Promise<Blog[]> {
    try {
        const res = await fetch(`${API_URL}/api/blogs?page=1`, {
            next: { revalidate: 3600 },
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            console.error(`Failed to fetch blogs status: ${res.status}`);
            return [];
        }

        const data: PaginatedResponse<Blog> = await res.json();
        let blogs: Blog[] = data?.data?.data || [];
        const lastPage = data?.data?.last_page || 1;

        if (lastPage > 1) {
            const promises = [];
            for (let i = 2; i <= lastPage; i++) {
                promises.push(
                    fetch(`${API_URL}/api/blogs?page=${i}`, { next: { revalidate: 3600 } })
                        .then(r => r.json())
                        .catch(err => {
                            console.error(`Error fetching page ${i}:`, err);
                            return null;
                        })
                );
            }
            const results = await Promise.all(promises);
            results.forEach((result: PaginatedResponse<Blog> | null) => {
                if (result?.data?.data) {
                    blogs.push(...result.data.data);
                }
            });
        }
        return blogs;
    } catch (error) {
        console.error('Error fetching blogs for sitemap:', error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const blogs = await getAllBlogs();

    // Blog Dynamic Routes
    const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: `${BASE_URL}/blogs/view/?slug=${blog.slug}`,
        lastModified: blog.updated_at || blog.created_at || new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${BASE_URL}/blogs/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/contact/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/privacy/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
    ];

    return [...staticRoutes, ...blogEntries];
}
