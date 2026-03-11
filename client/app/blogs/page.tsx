import React from 'react';
import { Metadata } from 'next';
import BlogsContent from '@/components/portfolio/BlogsContent';

export const metadata: Metadata = {
    title: "Blogs",
    description: "Read the latest insights and news from Shree Sarwadnya All in one Solutions.",
};

export default function BlogsPage() {
    return <BlogsContent />;
}


export const revalidate = 3600;
