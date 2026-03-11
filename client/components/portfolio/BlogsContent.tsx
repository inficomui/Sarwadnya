"use client";

import { useGetBlogsQuery } from "@/redux/apies/blogApi";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormattedDate from "@/components/common/FormattedDate";

export default function BlogsContent() {
    const [page, setPage] = useState(1);
    const { data: blogsData, isLoading, isError } = useGetBlogsQuery({ page });

    const stripHtml = (html: string) => {
        const allowed = html.replace(/<[^>]*>?/gm, '');
        return allowed.length > 150 ? allowed.substring(0, 150) + "..." : allowed;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-[50vh] text-red-500">
                Error loading blogs. Please try again later.
            </div>
        );
    }

    const blogs = blogsData?.data?.data || [];
    const meta = blogsData?.data;

    const totalPages = meta?.last_page || 1;
    const currentPage = meta?.current_page || 1;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Our Latest <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600">Insights</span>
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-muted-foreground">
                    Discover stories, thinking, and expertise from writers on any topic.
                </p>
            </div>

            {blogs.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10 text-xl">No blogs found.</div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="group flex flex-col rounded-2xl shadow-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className="shrink-0 relative h-56 w-full overflow-hidden">
                                <img
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    src={blog.image || "https://placehold.co/600x400/e2e8f0/1e293b?text=Blog+Image"}
                                    alt={blog.title}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-foreground uppercase tracking-wider shadow-sm">
                                        Article
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-primary mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        <FormattedDate date={blog.created_at} options={{ year: 'numeric', month: 'long', day: 'numeric' }} />
                                    </p>
                                    <Link href={`/blogs/view?slug=${blog.slug}`} className="block">
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="mt-3 text-base text-muted-foreground line-clamp-3 leading-relaxed">
                                            {stripHtml(blog.content || "")}
                                        </p>
                                    </Link>
                                </div>
                                <div className="mt-6 flex items-center pt-4 border-t border-border">
                                    <Link href={`/blogs/view?slug=${blog.slug}`} className="w-full">
                                        <Button className="w-full font-semibold shadow-lg shadow-primary/20" variant="default">Read Article</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-16 gap-4 items-center">
                    <Button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <span className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
