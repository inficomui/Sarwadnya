"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, DollarSign, Wallet, Eye, LogIn, Copy } from "lucide-react";
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from "@/redux/apies/usersCrudApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUpdateWalletAccessMutation } from "@/redux/apies/walletApi";
import { useImpersonateUserMutation } from "@/redux/apies/adminApi";
import toast from "react-hot-toast";
import { AdminTable } from "@/components/admin/AdminTable";
import { Switch } from "@/components/ui/switch";
import AdminWalletManagerDialog from "@/components/admin/AdminWalletManagerDialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function UsersPage() {
    const router = useRouter();
    const { adminUser } = useAdminAuth();
    const [walletManagerUser, setWalletManagerUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { data: usersData, isLoading, isFetching, refetch } = useGetUsersQuery({
        page,
        per_page: perPage,
        search: debouncedSearch
    });

    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [updateWalletAccess, { isLoading: isUpdatingWallet }] = useUpdateWalletAccessMutation();
    const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
    const [impersonateUser, { isLoading: isImpersonating }] = useImpersonateUserMutation();

    const handleImpersonate = async (user: any) => {
        try {
            await impersonateUser(user.id).unwrap();

            // Create a new window with the user session
            const newWindow = window.open('/dashboard', '_blank');

            if (newWindow) {
                // Wait for the new window to load
                newWindow.addEventListener('load', () => {
                    toast.success(`Opening ${user.name}'s dashboard in new window`);
                });
            } else {
                toast.error('Please allow popups to use impersonation feature');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to impersonate user');
        }
    };


    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await deleteUser(id).unwrap();
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleWalletToggle = async (id: number, is_wallet_active: boolean) => {
        try {
            await updateWalletAccess({ id, is_wallet_active }).unwrap();
            toast.success(`Wallet access ${is_wallet_active ? 'enabled' : 'disabled'} successfully`);
            refetch();
        } catch (error: any) {
            console.error("Failed to update wallet access:", error);
            const msg = error?.data?.message || "Failed to update wallet access";
            toast.error(msg);
        }
    };

    const handleCompanySupportToggle = async (id: number, company_support: boolean) => {
        try {
            await updateUser({ id, data: { company_support } }).unwrap();
            toast.success(`Company support ${company_support ? 'enabled' : 'disabled'} successfully`);
            // Optimistic update is handled by tags invalidation in RTK Query
        } catch (error: any) {
            console.error("Failed to update company support:", error);
            const msg = error?.data?.message || "Failed to update company support";
            toast.error(msg);
        }
    };

    // if (!adminUser) return null;

    // Define table columns
    const columns = [
        {
            key: "id",
            label: "#",
            render: (user: any) => <span className="text-muted-foreground">{user.id}</span>
        },
        {
            key: "user",
            label: "User",
            render: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: "phone_number",
            label: "Phone",
            render: (user: any) => <span className="text-foreground/80">{user.phone_number}</span>
        },
        {
            key: "referral_code",
            label: "Referral",
            render: (user: any) => (
                <span className="text-foreground/80 font-mono text-xs">{user.referral_code}</span>
            )
        },
        {
            key: "created_at",
            label: "Joined",
            render: (user: any) => (
                <span className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: "view_password",
            label: "Password",
            render: (user: any) => (
                <div className="flex items-center gap-2">
                    {user.view_password ? (
                        <>
                            <span className="text-foreground/80 font-mono text-xs bg-muted px-2 py-1 rounded">
                                {user.view_password}
                            </span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.view_password);
                                            toast.success('Password copied to clipboard');
                                        }}
                                    >
                                        <Copy size={14} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy Password</p>
                                </TooltipContent>
                            </Tooltip>
                        </>
                    ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                </div>
            )
        },
        {
            key: "wallet_access",
            label: "Wallet Access",
            render: (user: any) => (
                <div className="flex-col items-center gap-2">
                    <Switch
                        checked={user.is_wallet_active}
                        onCheckedChange={(checked: any) => handleWalletToggle(user.id, checked)}
                        disabled={isUpdatingWallet}
                    />
                    <span className={`text-xs ${user.is_wallet_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {user.is_wallet_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            )
        },
        {
            key: "company_support",
            label: "Company Support",
            render: (user: any) => (
                <div className="flex-col items-center gap-2">
                    <Switch
                        checked={user.company_support || false}
                        onCheckedChange={(checked: boolean) => handleCompanySupportToggle(user.id, checked)}
                        disabled={isUpdatingUser}
                        className="data-[state=checked]:bg-orange-500"
                    />
                    <span className={`text-xs ${user.company_support ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                        {user.company_support ? 'Active' : 'Inactive'}
                    </span>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (user: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(user.id.toString());
                                toast.success("User ID copied");
                            }}
                        >
                            Copy User ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleImpersonate(user)} disabled={isImpersonating}>
                            <LogIn className="mr-2 h-4 w-4" />
                            <span>Login as User</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/users/edit?id=${user.id}`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit Details</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/users/investments?id=${user.id}`} className="cursor-pointer">
                                <DollarSign className="mr-2 h-4 w-4" />
                                <span>Financial Overview</span>
                            </Link>
                        </DropdownMenuItem>
                        {user.is_wallet_active && (
                            <DropdownMenuItem onClick={() => setWalletManagerUser(user)}>
                                <Wallet className="mr-2 h-4 w-4" />
                                <span>Manage Wallet</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];
    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset to page 1 when perPage changes
    useEffect(() => {
        setPage(1);
    }, [perPage]);

    return (
        <>
            <AdminTable
                // Header
                title="User Management"
                subtitle="Manage and view all registered users."
                headerActions={
                    <Link href="/admin/dashboard/users/create">
                        <Button variant="default" size="default">
                            <Plus className="w-4 h-4" />
                            Add User
                        </Button>
                    </Link>
                }

                // Search
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search users..."

                // Table
                columns={columns}
                data={usersData?.data.data || []}
                keyExtractor={(user: any) => user.id.toString()}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="No users found."

                // Pagination
                currentPage={usersData?.data.current_page || 1}
                lastPage={usersData?.data.last_page || 1}
                from={usersData?.data.from || 0}
                to={usersData?.data.to || 0}
                total={usersData?.data.total || 0}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                hasNextPage={!!usersData?.data.next_page_url}
                hasPrevPage={!!usersData?.data.prev_page_url}
                itemName="users"
                onRefresh={refetch}
            />
            {
                walletManagerUser && (
                    <AdminWalletManagerDialog
                        open={!!walletManagerUser}
                        onOpenChange={(open) => !open && setWalletManagerUser(null)}
                        userId={walletManagerUser.id}
                        userName={walletManagerUser.name}
                        currentBalance={walletManagerUser.wallet_balance}
                        isWalletActive={walletManagerUser.is_wallet_active}
                        onSuccess={() => {
                            refetch();
                            setWalletManagerUser(null);
                        }}
                        trigger={null}
                    />
                )
            }

        </>
    );
}
