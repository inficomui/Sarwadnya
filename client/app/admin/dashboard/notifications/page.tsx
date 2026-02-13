"use client";

import { useState } from "react";
import { useSendNotificationMutation } from "@/redux/apies/adminApi";
import { useGetUsersQuery } from "@/redux/apies/usersCrudApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Bell, Send, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";

export default function NotificationsPage() {
    const { adminUser } = useAdminAuth();
    const [sendNotification, { isLoading }] = useSendNotificationMutation();
    // Use stable query args to prevent infinite re-renders
    const [queryParams] = useState({ per_page: 1000 });
    const { data: usersData, isLoading: areUsersLoading } = useGetUsersQuery(queryParams);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    // Multi-select state
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

    const handleSend = async (e: React.FormEvent) => {
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
                // We'll iterate and send requests. 
                // Note: For large numbers, a bulk API would be better, but we are sticking to existing logic/API.
                const promises = selectedUsers.map(id =>
                    sendNotification({
                        title,
                        body,
                        user_id: id
                    }).unwrap()
                );
                await Promise.all(promises);
            }

            toast.success("Notification(s) sent successfully!");
            setTitle("");
            setBody("");
            setSelectedUsers([]);
            setSendToAll(true);
        } catch (error: any) {
            console.error("Notification error:", error);
            toast.error(error?.data?.message || "Failed to send notification");
        }
    };

    if (!adminUser) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="text-primary" />
                        Push Notifications
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Send alerts and messages to mobile app users.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <form onSubmit={handleSend} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Notification Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="e.g., Special Offer, Maintenance Alert"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Message Body
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                            placeholder="Enter the main content of your notification..."
                        />
                    </div>

                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Target Audience
                    </label>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={sendToAll}
                                    onChange={(e) => setSendToAll(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/40 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">
                                    Send to All Users
                                </span>
                            </label>
                        </div>

                        {!sendToAll && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-950 p-2">
                                    {areUsersLoading ? (
                                        <div className="text-center py-8 text-slate-500 text-sm">Loading users...</div>
                                    ) : (
                                        <ScrollArea className="h-[200px]">
                                            {filteredUsers.length === 0 ? (
                                                <div className="text-center py-8 text-slate-500 text-sm">No users found</div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {filteredUsers.map((user: any) => (
                                                        <div
                                                            key={user.id}
                                                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors ${selectedUsers.includes(user.id) ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                                                            onClick={() => toggleUser(user.id)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedUsers.includes(user.id)}
                                                                onChange={() => toggleUser(user.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{user.name}</span>
                                                                <span className="text-xs text-slate-500">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    )}
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                                    <span>{selectedUsers.length} users selected</span>
                                    {selectedUsers.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUsers([])}
                                            className="text-primary hover:text-primary/90 font-medium"
                                        >
                                            Clear Selection
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {sendToAll
                            ? "Notification will be sent to ALL registered users."
                            : "Select specific users to receive this notification."}
                    </p>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold gap-2 transition-all hover:scale-[1.01]"
                    >
                        {isLoading ? "Sending..." : (
                            <>
                                <Send size={20} />
                                Send Notification
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
