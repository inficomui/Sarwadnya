"use client";

import { useState, useEffect } from "react";
import { useGetSlidersQuery, useDeleteSliderMutation } from "@/redux/apies/sliderApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, ImageOff, CheckCircle2, Info } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";

const SliderImage = ({ src, alt }: { src: string | null, alt: string }) => {
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

export default function AdminSlidersPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: sliders = [], isLoading, refetch, isFetching } = useGetSlidersQuery();
    const [deleteSlider, { isLoading: isDeleting }] = useDeleteSliderMutation();

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this slider?")) return;
        try {
            await deleteSlider(id).unwrap();
            refetch();
        } catch (err) {
            console.error("Failed to delete slider", err);
        }
    };

    // Client-side filtering and sorting
    const sortedSliders = [...sliders].sort((a: any, b: any) => a.order - b.order);

    const filteredSliders = sortedSliders.filter((slider: any) =>
        slider.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (slider.status ? "active" : "inactive").includes(debouncedSearch.toLowerCase())
    );

    // Calculate which sliders are currently "Live" (Top 5 Active)
    const activeSliders = sortedSliders.filter((s: any) => s.status);
    const liveSliderIds = activeSliders.slice(0, 5).map((s: any) => s.id);

    // Define columns
    const columns = [
        {
            key: "id",
            label: "#",
            render: (slider: any) => <span className="text-muted-foreground">{slider.id}</span>
        },
        {
            key: "image",
            label: "Image",
            render: (slider: any) => (
                <div className="h-16 w-32 shrink-0 overflow-hidden rounded-xl border border-border shadow-sm">
                    <SliderImage src={slider.image} alt={slider.title || 'Slider'} />
                </div>
            )
        },
        {
            key: "title",
            label: "Title / Info",
            render: (slider: any) => (
                <div>
                    <div className="font-semibold text-foreground line-clamp-1 max-w-xs">
                        {slider.title || "No Title"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-xs">
                        {slider.description || "No description"}
                    </div>
                    {liveSliderIds.includes(slider.id) && (
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                            <CheckCircle2 size={10} />
                            LIVE ON HOME
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "order",
            label: "Order",
            render: (slider: any) => (
                <span className="text-foreground font-medium">{slider.order}</span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (slider: any) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${slider.status
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${slider.status ? 'bg-emerald-500' : 'bg-destructive'
                        }`}></span>
                    {slider.status ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (slider: any) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/dashboard/sliders/edit?id=${slider.id}`} title="Edit">
                        <Button variant="warning" size="icon">
                            <Edit size={16} />
                        </Button>
                    </Link>
                    <Button
                        variant="danger"
                        size="icon"
                        onClick={() => handleDelete(slider.id)}
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
        <div className="space-y-4">
            {/* Info Alert */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 text-blue-800 dark:text-blue-300">
                <Info className="shrink-0 h-5 w-5 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold mb-1">How Sliders Work</p>
                    <p>Only the <strong>first 5 active sliders</strong> (sorted by Order) will be displayed on the home page. You can change the display order by editing the "Order" number of a slider. Lower numbers appear first.</p>
                </div>
            </div>

            <AdminTable
                // Header
                title="Slider Management"
                subtitle="Manage your landing page sliders."
                headerActions={
                    <Link href="/admin/dashboard/sliders/create">
                        <Button variant="default" size="default">
                            <Plus className="w-4 h-4" />
                            Add New Slider
                        </Button>
                    </Link>
                }

                // Search
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search sliders..."

                // Table
                columns={columns}
                data={filteredSliders}
                keyExtractor={(slider: any) => slider.id.toString()}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="No sliders found."

                // Pagination (sliders don't have pagination from API, so we use dummy values)
                currentPage={1}
                lastPage={1}
                from={filteredSliders.length > 0 ? 1 : 0}
                to={filteredSliders.length}
                total={filteredSliders.length}
                perPage={filteredSliders.length || 10}
                onPageChange={() => { }}
                onPerPageChange={() => { }}
                hasNextPage={false}
                hasPrevPage={false}
                itemName="sliders"
                onRefresh={refetch}
            />
        </div>
    );
}
