import { Metadata } from "next";
import BlogDetailsClient from "./BlogDetailsClient";

export const dynamic = 'force-static';

export async function generateStaticParams() {
    // For static export, you should ideally return valid slugs here.
    // However, if you're using searchParams (query strings) like ?slug=...
    // then static export won't work perfectly for dynamic content anyway.
    // If you're switching to file-based routing like [slug]/page.tsx, 
    // static export works great.

    // For now, to unblock the build while using ?slug=...
    return [];
}

type Props = {
    searchParams: Promise<{ slug?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const slug = (await searchParams).slug || "";

    return {
        title: slug ? `Blog: ${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` : "Blog Post",
    };
}

export default function BlogViewPage() {
    return <BlogDetailsClient />;
}
