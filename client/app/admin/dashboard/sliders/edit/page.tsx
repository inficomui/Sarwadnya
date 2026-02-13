"use client";

import { useState, useEffect, Suspense } from "react";
import { useGetSlidersQuery, useUpdateSliderMutation } from "@/redux/apies/sliderApi";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Slider } from "@/redux/apies/sliderApi";

function EditSliderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const { data: sliders = [], isLoading: isFetching } = useGetSlidersQuery();
    const [updateSlider, { isLoading: isUpdating }] = useUpdateSliderMutation();

    const [slider, setSlider] = useState<Slider | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [order, setOrder] = useState(0);
    const [status, setStatus] = useState(true);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    useEffect(() => {
        if (sliders.length > 0 && id) {
            const foundSlider = sliders.find((s) => s.id === Number(id));
            if (foundSlider) {
                setSlider(foundSlider);
                setTitle(foundSlider.title || "");
                setDescription(foundSlider.description || "");
                setLink(foundSlider.link || "");
                setOrder(foundSlider.order || 0);
                setStatus(foundSlider.status);
                setImagePreview(foundSlider.image);
            }
        }
    }, [sliders, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) return;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("link", link);
        formData.append("order", order.toString());
        formData.append("status", status ? "1" : "0");

        if (image) {
            formData.append("image", image);
        }



        try {
            await updateSlider({ id: Number(id), formData }).unwrap();
            router.push("/admin/dashboard/sliders");
        } catch (err) {
            console.error("Failed to update slider", err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Accept all common image types
            const validTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/svg+xml',
                'image/webp',
                'image/bmp',
                'image/x-icon',
                'image/vnd.microsoft.icon'
            ];

            if (!validTypes.includes(file.type)) {
                setImageError("Please upload a valid image file (JPEG, PNG, GIF, SVG, WebP, BMP, ICO)");
                e.target.value = "";
                return;
            }

            setImageError(null);
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
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!slider && !isFetching) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Slider not found or invalid ID.</p>
                <Button variant="ghost" onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 bg-card p-4 md:p-6 rounded-3xl border border-border shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl hover:bg-muted shrink-0"
                >
                    <ArrowLeft size={20} className="md:w-6 md:h-6 text-muted-foreground" />
                </Button>
                <div>
                    <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground">Edit Slider</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">Update slider details and image.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Form Fields Column */}
                <div className="space-y-4 md:space-y-6">
                    {/* Title */}
                    <div className="bg-card p-4 md:p-6 rounded-3xl border border-border shadow-sm space-y-3 md:space-y-4">
                        <label className="text-xs md:text-sm font-semibold text-foreground ml-1">Title (Optional)</label>
                        <input
                            type="text"
                            className="flex h-10 md:h-12 w-full rounded-xl border border-border bg-muted/30 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                            placeholder="Enter slider title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="bg-card p-4 md:p-6 rounded-3xl border border-border shadow-sm space-y-3 md:space-y-4">
                        <label className="text-xs md:text-sm font-semibold text-foreground ml-1">Description (Optional)</label>
                        <textarea
                            className="flex min-h-[80px] md:min-h-[100px] w-full rounded-xl border border-border bg-muted/30 px-3 md:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none"
                            placeholder="Enter a brief description..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Link */}
                    <div className="bg-card p-4 md:p-6 rounded-3xl border border-border shadow-sm space-y-3 md:space-y-4">
                        <label className="text-xs md:text-sm font-semibold text-foreground ml-1">Redirect Link (Optional)</label>
                        <input
                            type="text"
                            className="flex h-10 md:h-12 w-full rounded-xl border border-border bg-muted/30 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                            placeholder="https://..."
                            value={link}
                            onChange={e => setLink(e.target.value)}
                        />
                    </div>

                    {/* Order & Status */}
                    <div className="bg-card p-4 md:p-6 rounded-3xl border border-border shadow-sm grid grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-foreground ml-1">Sort Order</label>
                            <input
                                type="number"
                                className="flex h-10 md:h-12 w-full rounded-xl border border-border bg-muted/30 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                                placeholder="0"
                                value={order}
                                onChange={e => setOrder(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-foreground ml-1">Status</label>
                            <select
                                className="appearance-none flex w-full rounded-xl border border-border bg-muted/30 px-3 md:px-4 py-2 md:py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer text-foreground h-10 md:h-12"
                                value={status ? "active" : "inactive"}
                                onChange={e => setStatus(e.target.value === "active")}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Image Upload Column */}
                <div className="space-y-6 md:space-y-8">
                    {/* Featured Image Card */}
                    <div className="bg-card rounded-3xl border border-border shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
                        <h3 className="font-bold text-base md:text-lg text-foreground border-b border-border pb-3 md:pb-4">
                            Slider Image
                        </h3>

                        <div className="w-full">
                            <label
                                className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full group overflow-hidden rounded-2xl">
                                        <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ImageIcon className="w-8 h-8 text-white mb-2" />
                                            <p className="text-white text-sm font-semibold">Click to change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <div className="p-3 md:p-4 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                                            <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                                        </div>
                                        <p className="mb-2 text-xs md:text-sm text-muted-foreground font-medium">Click to upload image</p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground/70">All image formats supported</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                            {imageError && (
                                <p className="text-xs md:text-sm text-red-500 mt-2 text-center font-medium">
                                    {imageError}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" disabled={isUpdating} className="w-full h-12 md:h-14 rounded-xl text-sm md:text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isUpdating ? "Updating..." : "Update Slider"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function EditSliderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditSliderContent />
        </Suspense>
    );
}

