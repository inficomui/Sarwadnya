"use client";

import { useGetBlogBySlugQuery } from "@/redux/apies/blogApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import FormattedDate from "@/components/common/FormattedDate";

function BlogDetailsContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug") || "";

    const { data: blogData, isLoading, isError } = useGetBlogBySlugQuery(slug, {
        skip: !slug
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Loading Article...</p>
                </div>
            </div>
        );
    }

    if (isError || !blogData) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <FileText size={64} className="text-muted-foreground/30" />
                <div className="text-xl font-semibold text-foreground">Blog post not found</div>
                <Link href="/blogs">
                    <Button>Back to all blogs</Button>
                </Link>
            </div>
        );
    }

    const blog = blogData.data;

    return (
        <div className="pb-16 mobile-padding-fix">

            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] w-full bg-zinc-900 dark:bg-zinc-950 overflow-hidden rounded-xl sm:rounded-2xl mx-auto max-w-[95%] sm:max-w-7xl mt-4 sm:mt-0 shadow-2xl">
                {blog.image ? (
                    <>
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover absolute inset-0 z-0"
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-purple-800/30 z-0" />
                )}

                <div className="absolute inset-0 z-20 flex flex-col justify-end pb-8 sm:pb-12 px-6 sm:px-12 max-w-4xl mx-auto w-full">
                    <Link href="/blogs" className="inline-block mb-4 sm:mb-6">
                        <span className="inline-flex items-center text-white/90 hover:text-white transition-colors gap-2 bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md text-sm border border-white/10">
                            <ArrowLeft size={14} /> Back to Blogs
                        </span>
                    </Link>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center text-white/90 text-sm font-medium gap-y-2">
                        <div className="flex items-center mr-4">
                            <Calendar size={16} className="mr-2 opacity-80" />
                            <time dateTime={blog.created_at}>
                                <FormattedDate date={blog.created_at} options={{ year: 'numeric', month: 'long', day: 'numeric' }} />
                            </time>
                        </div>
                        <span className="hidden sm:inline mx-3 opacity-60">•</span>
                        <span className="bg-primary/90 text-white px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider shadow-sm font-semibold">
                            {blog.status}
                        </span>
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
                <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border border-border">
                    {blog.video && (
                        <div className="mb-8 rounded-xl overflow-hidden shadow-lg aspect-video bg-black ring-1 ring-border">
                            {blog.video.includes('youtube') || blog.video.includes('vimeo') ? (
                                <iframe
                                    src={blog.video}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video controls className="w-full h-full">
                                    <source src={blog.video} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none 
                    prose-headings:text-foreground prose-headings:font-bold 
                    prose-p:text-muted-foreground prose-p:leading-relaxed 
                    prose-a:text-primary prose-a:font-medium hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-img:rounded-xl prose-img:shadow-md
                    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                    prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-4">Enjoyed this article?</p>
                    <Link href="/blogs">
                        <Button variant="outline" size="lg" className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground border-primary/20">
                            Read More Articles
                        </Button>
                    </Link>
                </div>
            </article>
        </div>
    )
}

export default function BlogDetailsClient() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" /></div>}>
            <BlogDetailsContent />
        </Suspense>
    );
}
