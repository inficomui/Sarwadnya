"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    useGetTestimonialsQuery,
    useCreateTestimonialMutation,
    useUpdateTestimonialMutation,
    useDeleteTestimonialMutation
} from "@/redux/apies/testimonialApi";
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    X,
    Star,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Testimonial } from "@/lib/types";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminTestimonialsPage() {
    // Note: Authentication is handled by the layout (AdminDashboardLayout)
    const { data: testimonialsData, isLoading, refetch, isFetching } = useGetTestimonialsQuery();
    const [createTestimonial, { isLoading: isCreating }] = useCreateTestimonialMutation();
    const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
    const [deleteTestimonial, { isLoading: isDeleting }] = useDeleteTestimonialMutation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    // Filter & Pagination State
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        company: "",
        content: "",
        rating: 5,
        status: 1,
        avatar: null as File | null
    });
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (editingTestimonial) {
            setFormData({
                name: editingTestimonial.name,
                designation: editingTestimonial.designation || "",
                company: editingTestimonial.company || "",
                content: editingTestimonial.content,
                rating: editingTestimonial.rating,
                status: editingTestimonial.status,
                avatar: null
            });
            setPreviewAvatar(editingTestimonial.avatar);
            setIsFormOpen(true);
        } else {
            setFormData({
                name: "",
                designation: "",
                company: "",
                content: "",
                rating: 5,
                status: 1,
                avatar: null
            });
            setPreviewAvatar(null);
        }
    }, [editingTestimonial]);

    // Client-side filtering and pagination logic
    const filteredData = useMemo(() => {
        if (!testimonialsData?.data) return [];
        if (!search) return testimonialsData.data;
        const lowerSearch = search.toLowerCase();
        return testimonialsData.data.filter(t =>
            t.name.toLowerCase().includes(lowerSearch) ||
            t.company?.toLowerCase().includes(lowerSearch) ||
            t.designation?.toLowerCase().includes(lowerSearch) ||
            t.content.toLowerCase().includes(lowerSearch)
        );
    }, [testimonialsData, search]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, page, perPage]);

    const total = filteredData.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    // Reset page when search or perPage changes
    useEffect(() => {
        setPage(1);
    }, [search, perPage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, avatar: file }));
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("content", formData.content);
            if (formData.designation) data.append("designation", formData.designation);
            if (formData.company) data.append("company", formData.company);
            data.append("rating", formData.rating.toString());
            data.append("status", formData.status.toString());
            if (formData.avatar) data.append("avatar", formData.avatar);

            if (editingTestimonial) {
                await updateTestimonial({ id: editingTestimonial.id, formData: data }).unwrap();
                toast.success("Testimonial updated successfully");
            } else {
                await createTestimonial(data).unwrap();
                toast.success("Testimonial created successfully");
            }
            handleCloseForm();
            refetch();
        } catch (error: any) {
            console.error("Error submitting testimonial:", error);
            toast.error(error?.data?.message || "Failed to submit testimonial");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            try {
                await deleteTestimonial(id).unwrap();
                toast.success("Testimonial deleted successfully");
                refetch();
            } catch (error: any) {
                console.error("Error deleting testimonial:", error);
                toast.error(error?.data?.message || "Failed to delete testimonial");
            }
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTestimonial(null);
    };

    // Table Columns
    const columns = [
        {
            key: "user",
            label: "User",
            render: (item: Testimonial) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                        {item.avatar ? (
                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                {item.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={10}
                                    className={i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "role",
            label: "Role / Company",
            render: (item: Testimonial) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.designation || "-"}</span>
                    <span className="text-xs text-muted-foreground">{item.company || "-"}</span>
                </div>
            )
        },
        {
            key: "content",
            label: "Review Content",
            render: (item: Testimonial) => (
                <div className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate" title={item.content}>
                        "{item.content}"
                    </p>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (item: Testimonial) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 1 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {item.status === 1 ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: "created_at",
            label: "Date",
            render: (item: Testimonial) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (item: Testimonial) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="danger"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete Testimonial</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                <AdminTable
                    title="Testimonials"
                    subtitle="Manage customer testimonials and reviews."
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name, company or content..."
                    columns={columns}
                    data={paginatedData}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="No testimonials found."
                    currentPage={page}
                    lastPage={lastPage}
                    from={from}
                    to={to}
                    total={total}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    hasNextPage={page < lastPage}
                    hasPrevPage={page > 1}
                    itemName="testimonials"
                    onRefresh={refetch}
                />
            </AnimatePresence>
        </div>
    );
}
