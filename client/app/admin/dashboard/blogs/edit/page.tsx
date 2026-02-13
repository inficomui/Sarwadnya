"use client";

import { useState, useEffect, Suspense } from "react";
import { useGetBlogBySlugQuery, useUpdateBlogMutation } from "@/redux/apies/blogApi";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Video, Edit2, Eye } from "lucide-react";

function EditBlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const { data: blogData, isLoading: isFetching } = useGetBlogBySlugQuery(slug as string, { skip: !slug });
    const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("published");
    const [image, setImage] = useState<File | null>(null);
    const [video, setVideo] = useState<string>("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (blogData?.data) {
            const blog = blogData.data;
            setTitle(blog.title);
            setContent(blog.content);
            setStatus(blog.status);
            setImagePreview(blog.image);
            if (blog.video && !blog.video.startsWith("blob:")) {
                setVideo(blog.video);
            }
        }
    }, [blogData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!blogData?.data?.id) return;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("status", status);
        if (image) formData.append("image", image);

        if (videoFile) {
            formData.append("video", videoFile);
        } else if (video && video !== blogData.data.video) {
            formData.append("video", video);
        }

        try {
            await updateBlog({ id: blogData.data.id, formData }).unwrap();
            router.push("/admin/dashboard/blogs");
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isFetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading editor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-12 w-12 rounded-xl hover:bg-muted"
                >
                    <ArrowLeft size={24} className="text-muted-foreground" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Blog Post</h1>
                    <p className="text-sm text-muted-foreground">Make changes to your existing article.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Title */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <label className="text-sm font-semibold text-foreground ml-1">Article Title</label>
                        <input
                            type="text"
                            className="flex h-16 w-full rounded-2xl border border-border bg-muted/30 px-6 py-4 text-xl font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Content Editor */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-semibold text-foreground">Content</label>
                            <div className="bg-muted p-1.5 rounded-xl flex text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${!showPreview ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Edit2 size={14} /> Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showPreview ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Eye size={14} /> Preview
                                </button>
                            </div>
                        </div>

                        {showPreview ? (
                            <div
                                className="min-h-[500px] w-full rounded-2xl border border-border bg-muted/30 p-8 prose dark:prose-invert max-w-none overflow-y-auto
                                prose-headings:text-foreground prose-headings:font-bold 
                                prose-p:text-muted-foreground prose-p:leading-relaxed 
                                prose-a:text-primary prose-a:font-medium hover:prose-a:underline
                                prose-strong:text-foreground
                                prose-img:rounded-2xl prose-img:shadow-lg
                                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl"
                                dangerouslySetInnerHTML={{ __html: content || "<div class='h-full flex items-center justify-center text-muted-foreground italic'>Nothing to preview yet...</div>" }}
                            />
                        ) : (
                            <div className="relative group">
                                <textarea
                                    className="flex min-h-[500px] w-full rounded-2xl border border-border bg-muted/30 px-6 py-6 leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm resize-y text-foreground"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    required
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-medium text-muted-foreground bg-background/50 backdrop-blur px-3 py-1.5 rounded-full border border-border pointer-events-none">
                                    Markdown / HTML Supported
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Publish Card */}
                    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
                        <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">Publishing</h3>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                                <div className="relative">
                                    <select
                                        className="appearance-none flex w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer text-foreground"
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={isUpdating} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    {/* Featured Image Card */}
                    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
                        <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">Featured Image</h3>

                        <div className="w-full">
                            <label
                                className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full group overflow-hidden rounded-2xl">
                                        <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ImageIcon className="w-8 h-8 text-white mb-2" />
                                            <p className="text-white text-sm font-semibold">Click to change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <div className="p-4 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="mb-2 text-sm text-muted-foreground font-medium">Click to upload image</p>
                                        <p className="text-xs text-muted-foreground/70">SVG, PNG, JPG or GIF</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    {/* Video Card */}
                    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
                        <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">Video Content</h3>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Video URL</label>
                                <div className="relative group">
                                    <Video className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="url"
                                        className="flex h-11 w-full rounded-xl border border-border bg-muted/30 pl-10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                                        placeholder="https://youtube.com/..."
                                        value={video}
                                        onChange={e => {
                                            setVideo(e.target.value);
                                            setVideoFile(null);
                                        }}
                                        disabled={!!videoFile}
                                    />
                                </div>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="grow border-t border-border"></div>
                                <span className="shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase">OR</span>
                                <div className="grow border-t border-border"></div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upload Video</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setVideoFile(file);
                                                setVideo("");
                                            }
                                        }}
                                        disabled={!!video && video.length > 0}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function EditBlogPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading editor...</p>
                </div>
            </div>
        }>
            <EditBlogContent />
        </Suspense>
    );
}
