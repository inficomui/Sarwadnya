"use client";

import React, { useState, useEffect } from "react";
import {
    Loader2,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    AlertCircle
} from "lucide-react";
import {
    useGetAdminKycFieldsQuery,
    useAddAdminKycFieldMutation,
    useUpdateAdminKycFieldMutation,
    useDeleteAdminKycFieldMutation
} from "@/redux/apies/kycApi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface KycFieldForm {
    label: string;
    name: string;
    type: 'text' | 'number' | 'file';
    required: boolean;
    order: number;
}

const initialForm: KycFieldForm = {
    label: "",
    name: "",
    type: "text",
    required: true,
    order: 0
};

export default function KycFieldsPage() {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<any>(null); // Replace with actual type if available

    // API Hooks
    const { data: fields, isLoading, isFetching, refetch } = useGetAdminKycFieldsQuery();
    const [addField, { isLoading: isAdding }] = useAddAdminKycFieldMutation();
    const [updateField, { isLoading: isUpdating }] = useUpdateAdminKycFieldMutation();
    const [deleteField, { isLoading: isDeleting }] = useDeleteAdminKycFieldMutation();

    // Local State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<KycFieldForm>(initialForm);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    useEffect(() => {
        // Check if admin is logged in
        if (typeof window !== "undefined") {
            const adminUserStr = localStorage.getItem("adminUser");
            if (adminUserStr) {
                try {
                    setAdminUser(JSON.parse(adminUserStr));
                } catch (error) {
                    console.error("Error parsing admin user data:", error);
                }
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { name, ...updateData } = formData;
                await updateField({ id: editingId, ...updateData }).unwrap();
                toast.success("KYC Field updated successfully");
            } else {
                await addField(formData).unwrap();
                toast.success("KYC Field added successfully");
            }
            setIsAddModalOpen(false);
            setFormData(initialForm);
            setEditingId(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || `Failed to ${editingId ? 'update' : 'add'} field`);
        }
    };

    const handleEditClick = (field: any) => {
        setFormData({
            label: field.label,
            name: field.name,
            type: field.type,
            required: field.required === 1 || field.required === true, // handle potential 0/1 from db
            order: field.order
        });
        setEditingId(field.id);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteField(itemToDelete).unwrap();
            toast.success("KYC Field deleted");
            setItemToDelete(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete field");
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setFormData(initialForm);
        setEditingId(null);
    };

    if (!adminUser) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">KYC Field Management</h1>
                    <p className="text-muted-foreground text-sm">Define the dynamic fields required for user verification.</p>
                </div>

                <Button onClick={() => { setFormData(initialForm); setEditingId(null); setIsAddModalOpen(true); }} variant="default" size="default">
                    <Plus className="w-4 h-4" />
                    Add Field
                </Button>
            </div>

            {/* Toolbar */}
            <div className="bg-card border border-border rounded-xl p-4 flex justify-end items-center shadow-sm">
                <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="default"

                >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Fields Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative min-h-[400px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order</th>
                                <th className="px-6 py-4 font-medium">Label</th>
                                <th className="px-6 py-4 font-medium">Field Name</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Required</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {fields?.map((field) => (
                                <tr key={field.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-foreground/80">{field.order}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{field.label}</td>
                                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{field.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                                            ${field.type === 'file' ? 'bg-blue-500/10 text-blue-500' :
                                                field.type === 'number' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-slate-500/10 text-slate-500'}`}>
                                            {field.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {field.required ? (
                                            <span className="text-green-500 text-xs font-bold">YES</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">NO</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="info"
                                                size="icon"
                                                onClick={() => handleEditClick(field)}
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="icon"
                                                onClick={() => handleDeleteClick(field.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {fields?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No fields defined yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Field Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border p-6 animate-in zoom-in-95">
                        <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit KYC Field' : 'Add New KYC Field'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g. Aadhaar Card Front"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Field Name (Unique)</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingId}
                                    className={`w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${editingId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. aadhaar_front"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="file">File Upload</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sort Order</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="required"
                                    checked={formData.required}
                                    onChange={e => setFormData({ ...formData, required: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="required" className="text-sm font-medium">Required Field</label>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit" disabled={isAdding}>
                                    {isAdding || isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {editingId ? 'Update Field' : 'Create Field'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl border border-border p-6 animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold mb-2">Delete Field?</h2>
                            <p className="text-muted-foreground text-sm mb-6">
                                This action cannot be undone. This field will be removed from all future KYC submissions.
                            </p>
                            <div className="flex justify-center gap-3 w-full">
                                <Button variant="outline" onClick={() => setItemToDelete(null)} className="flex-1">Cancel</Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmDelete}
                                    className="flex-1"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
