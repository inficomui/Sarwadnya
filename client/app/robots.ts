import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URI || 'https://shreesarwadnya.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/dashboard/',
                '/login/',
                '/signup/',
                '/forgot-password/',
                '/_next/',
                '/static/'
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
