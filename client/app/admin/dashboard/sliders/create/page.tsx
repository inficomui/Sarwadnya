"use client";

import { useState } from "react";
import { useCreateSliderMutation } from "@/redux/apies/sliderApi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function CreateSliderPage() {
    const router = useRouter();
    const [createSlider, { isLoading }] = useCreateSliderMutation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [order, setOrder] = useState(0);
    const [status, setStatus] = useState(true);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!image) {
            alert("Please upload an image.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("link", link);
        formData.append("order", order.toString());
        formData.append("status", status ? "1" : "0");
        formData.append("image", image, image.name);

        try {
            await createSlider(formData).unwrap();
            router.push("/admin/dashboard/sliders");
        } catch (err) {
            console.error("Failed to create slider", err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
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
                e.target.value = ""; // Reset input
                setImage(null);
                setImagePreview(null);
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

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
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
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Slider</h1>
                    <p className="text-sm text-muted-foreground">Create a new slide for the landing page.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Fields Column */}
                <div className="space-y-6">
                    {/* Title */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <label className="text-sm font-semibold text-foreground ml-1">Title (Optional)</label>
                        <input
                            type="text"
                            className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                            placeholder="Enter slider title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <label className="text-sm font-semibold text-foreground ml-1">Description (Optional)</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none"
                            placeholder="Enter a brief description..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Link */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <label className="text-sm font-semibold text-foreground ml-1">Redirect Link (Optional)</label>
                        <input
                            type="text"
                            className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                            placeholder="https://..."
                            value={link}
                            onChange={e => setLink(e.target.value)}
                        />
                    </div>

                    {/* Order & Status */}
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">Sort Order</label>
                            <input
                                type="number"
                                className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                                placeholder="0"
                                value={order}
                                onChange={e => setOrder(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">Status</label>
                            <select
                                className="appearance-none flex w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer text-foreground h-12"
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
                <div className="space-y-8">
                    {/* Featured Image Card */}
                    <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
                        <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">
                            Slider Image <span className="text-red-500">*</span>
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
                                        <div className="p-4 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="mb-2 text-sm text-muted-foreground font-medium">Click to upload image</p>
                                        <p className="text-xs text-muted-foreground/70">All image formats supported (Rec: 1920x600)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                            </label>
                            {imageError && (
                                <p className="text-sm text-red-500 mt-2 text-center font-medium">
                                    {imageError}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isLoading ? "Creating..." : "Create Slider"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
