"use client";

import { useState, useEffect } from "react";
import { useGetBlogsQuery, useDeleteBlogMutation } from "@/redux/apies/blogApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, ImageOff, ExternalLink } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";

const BlogImage = ({ src, alt }: { src: string | null, alt: string }) => {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                <ImageOff size={20} />
            </div>
        );
    }

    return (
        <img
            src={src}
            className="h-full w-full object-cover"
            alt={alt}
            onError={() => setError(true)}
        />
    );
};

export default function AdminBlogsPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when perPage changes
    useEffect(() => {
        setPage(1);
    }, [perPage]);

    const { data: blogsData, isLoading, refetch, isFetching } = useGetBlogsQuery({ page });
    const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await deleteBlog(id).unwrap();
            refetch();
        } catch (err) {
            console.error("Failed to delete blog", err);
        }
    };

    const blogs = blogsData?.data?.data || [];
    const meta = blogsData?.data;

    // Client-side filtering
    const filteredBlogs = blogs.filter((blog: any) =>
        blog.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        blog.status.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        blog.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // Define columns
    const columns = [
        {
            key: "id",
            label: "#",
            render: (blog: any) => <span className="text-muted-foreground">{blog.id}</span>
        },
        {
            key: "article",
            label: "Article",
            render: (blog: any) => (
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border shadow-sm">
                        <BlogImage src={blog.image} alt={blog.title} />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground line-clamp-1 max-w-xs">
                            {blog.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-xs font-mono">
                            /{blog.slug}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (blog: any) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${blog.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${blog.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </span>
            )
        },
        {
            key: "created_at",
            label: "Date",
            render: (blog: any) => (
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(blog.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (blog: any) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/blogs/${blog.slug}`} target="_blank" title="View Live">
                        <Button variant="info" size="icon">
                            <ExternalLink size={16} />
                        </Button>
                    </Link>
                    <Link href={`/admin/dashboard/blogs/edit?slug=${blog.slug}`} title="Edit">
                        <Button variant="warning" size="icon">
                            <Edit size={16} />
                        </Button>
                    </Link>
                    <Button
                        variant="danger"
                        size="icon"
                        onClick={() => handleDelete(blog.id)}
                        disabled={isDeleting}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AdminTable
            // Header
            title="Blog Management"
            subtitle="Create, edit, and oversee your content strategy."
            headerActions={
                <Link href="/admin/dashboard/blogs/create">
                    <Button variant="default" size="default">
                        <Plus className="w-4 h-4" />
                        Create New Post
                    </Button>
                </Link>
            }

            // Search
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search blogs..."

            // Table
            columns={columns}
            data={filteredBlogs}
            keyExtractor={(blog: any) => blog.id.toString()}
            isLoading={isLoading}
            isFetching={isFetching}
            emptyMessage="No blogs found."

            // Pagination
            currentPage={meta?.current_page || 1}
            lastPage={meta?.last_page || 1}
            from={meta?.from || 0}
            to={meta?.to || 0}
            total={meta?.total || 0}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            hasNextPage={!!meta?.next_page_url}
            hasPrevPage={!!meta?.prev_page_url}
            itemName="blogs"
            onRefresh={refetch}
        />
    );
}
