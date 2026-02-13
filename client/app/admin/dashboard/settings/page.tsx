"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { setAdminCredentials } from "@/redux/slices/adminSlice";
import { useSendNotificationMutation } from "@/redux/apies/adminApi";
import { useGetUsersQuery } from "@/redux/apies/usersCrudApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Save, Lock, Bell, User as UserIcon, CreditCard, Loader2, RefreshCw, Send, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { adminUser, adminToken } = useAdminAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Notification State
    const [sendNotification, { isLoading: isSendingNotification }] = useSendNotificationMutation();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    // Multi-select logic
    const [queryParams] = useState({ per_page: 1000 });
    const { data: usersData, isLoading: areUsersLoading } = useGetUsersQuery(queryParams);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [sendToAll, setSendToAll] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = (usersData?.data?.data || []).filter((user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (id: number) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(prev => prev.filter(userId => userId !== id));
        } else {
            setSelectedUsers(prev => [...prev, id]);
        }
    };

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: errorsProfile },
        reset: resetProfile
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: adminUser?.name || "",
            email: adminUser?.email || "",
        },
    });

    useEffect(() => {
        if (adminUser) {
            resetProfile({
                name: adminUser.name,
                email: adminUser.email,
            });
        }
    }, [adminUser, resetProfile]);

    const onSubmitProfile = (data: ProfileFormValues) => {
        console.log("Updating profile:", data);
        if (adminUser && adminToken) {
            const updatedUser = { ...adminUser, name: data.name };

            // Update Redux state
            dispatch(setAdminCredentials({ user: updatedUser, token: adminToken }));

            // Update Local Storage
            localStorage.setItem("adminUser", JSON.stringify(updatedUser));

            // Optional: Show success message/toast here
            alert("Profile updated successfully (Local only - Backend integration pending)");
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sendToAll && selectedUsers.length === 0) {
            toast.error("Please select at least one user or choose 'Send to All'");
            return;
        }

        try {
            if (sendToAll) {
                await sendNotification({
                    title,
                    body,
                    user_id: null
                }).unwrap();
            } else {
                // Send individually
                const promises = selectedUsers.map(id =>
                    sendNotification({
                        title,
                        body,
                        user_id: id
                    }).unwrap()
                );
                await Promise.all(promises);
            }

            toast.success("Notification sent successfully!");
            setTitle("");
            setBody("");
            setSelectedUsers([]);
            setSendToAll(true);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to send notification");
        }
    };

    if (!adminUser) return null;

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage system configurations and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <div className="md:col-span-1 space-y-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                        <UserIcon size={18} />
                        <span>Profile Settings</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${activeTab === 'payment' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                        <CreditCard size={18} />
                        <span>Payment Details</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                        <Lock size={18} />
                        <span>Security</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                        <Bell size={18} />
                        <span>Notifications</span>
                    </button>
                </div>

                {/* Settings Content */}
                <div className="md:col-span-3 space-y-6">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input
                                        {...registerProfile("name")}
                                        className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                    {errorsProfile.name && <p className="text-red-500 text-xs">{errorsProfile.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <input
                                        {...registerProfile("email")}
                                        disabled
                                        className="w-full bg-muted/70 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-medium text-sm hover:brightness-110"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* PAYMENT TAB */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold">Payment & Deposit Settings</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Manage bank accounts and Shree Sarwadnya All in one Solutions addresses for user deposits.</p>
                                    </div>
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <CreditCard size={24} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link href="/admin/dashboard/settings/banks" className="group block">
                                        <div className="h-full bg-background border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                    <CreditCard size={20} />
                                                </div>
                                                <span className="text-xs font-medium bg-secondary px-2 py-1 rounded text-secondary-foreground">Active</span>
                                            </div>
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Bank Accounts</h3>
                                            <p className="text-sm text-muted-foreground">Manage bank account details, add new accounts, or update existing ones.</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB (Placeholder) */}
                    {activeTab === 'security' && (
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center py-20">
                            <Lock size={40} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Security Settings</h3>
                            <p className="text-muted-foreground">Password change and 2FA features coming soon.</p>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">Send Push Notification</h2>
                                <p className="text-sm text-muted-foreground mt-1">Send alerts and messages to mobile app users.</p>
                            </div>

                            <form onSubmit={handleSendNotification} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Notification Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="e.g., Special Offer, Maintenance Alert"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Message Body
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                        placeholder="Enter the main content of your notification..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Target Audience
                                    </label>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card border-border">
                                            <label className="relative inline-flex items-center cursor-pointer w-full">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={sendToAll}
                                                    onChange={(e) => setSendToAll(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/40 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                <span className="ml-3 text-sm font-medium text-foreground">
                                                    Send to All Users
                                                </span>
                                            </label>
                                        </div>

                                        {!sendToAll && (
                                            <div className="border border-border rounded-lg overflow-hidden">
                                                <div className="p-3 border-b border-border bg-muted/30">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                        <input
                                                            type="text"
                                                            placeholder="Search users..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="bg-card p-2">
                                                    {areUsersLoading ? (
                                                        <div className="text-center py-8 text-muted-foreground text-sm">Loading users...</div>
                                                    ) : (
                                                        <ScrollArea className="h-[200px]">
                                                            {filteredUsers.length === 0 ? (
                                                                <div className="text-center py-8 text-muted-foreground text-sm">No users found</div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    {filteredUsers.map((user: any) => (
                                                                        <div
                                                                            key={user.id}
                                                                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedUsers.includes(user.id) ? 'bg-primary/10' : ''}`}
                                                                            onClick={() => toggleUser(user.id)}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedUsers.includes(user.id)}
                                                                                onChange={() => toggleUser(user.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                                                                            />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-sm font-medium">{user.name}</span>
                                                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </ScrollArea>
                                                    )}
                                                </div>
                                                <div className="p-2 bg-muted/30 border-t border-border text-xs text-muted-foreground flex justify-between items-center">
                                                    <span>{selectedUsers.length} users selected</span>
                                                    {selectedUsers.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedUsers([])}
                                                            className="text-primary hover:underline font-medium"
                                                        >
                                                            Clear Selection
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {sendToAll
                                            ? "Notification will be sent to ALL registered users."
                                            : "Select specific users to receive this notification."}
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSendingNotification}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold gap-2"
                                >
                                    {isSendingNotification ? "Sending..." : (
                                        <>
                                            <Send size={20} />
                                            Send Notification
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
