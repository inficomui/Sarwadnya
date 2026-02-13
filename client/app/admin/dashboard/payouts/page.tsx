"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { useGetAdminPayoutsByRangeQuery } from "@/redux/apies/adminApi";
import { useGetUsersQuery } from "@/redux/apies/usersCrudApi";
import { useMaturePayoutMutation } from "@/redux/apies/payoutApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import FormattedDate from "@/components/common/FormattedDate";
import { Calendar, Search, Filter, CheckCircle, Loader2, ChevronDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
// import { toast } from "sonner";

export default function AdminPayoutsPage() {
    const { adminUser } = useAdminAuth();
    // Helper to get formatted date string (YYYY-MM-DD)
    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate default range (Current Month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [startDate, setStartDate] = useState(getFormattedDate(firstDay));
    const [endDate, setEndDate] = useState(getFormattedDate(lastDay));
    const [userId, setUserId] = useState(""); // Optional filter by User ID
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchTriggered, setIsSearchTriggered] = useState(true); // Auto-trigger on mount
    const [maturingPayoutId, setMaturingPayoutId] = useState<number | null>(null);

    // User Dropdown State
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearchText, setUserSearchText] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const {
        data: payoutsData,
        isLoading,
        isFetching,
        refetch,
    } = useGetAdminPayoutsByRangeQuery(
        { start_date: startDate, end_date: endDate, user_id: userId ? Number(userId) : undefined },
        { skip: !isSearchTriggered || !startDate || !endDate }
    );

    const [maturePayout, { isLoading: isMaturingPayout }] = useMaturePayoutMutation();
    const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({ per_page: 1000 }); // Fetch users for dropdown

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            setIsSearchTriggered(true);
            setCurrentPage(1); // Reset to first page on new search
        }
    };

    const handleRefresh = () => {
        if (isSearchTriggered) {
            refetch();
        }
    };

    const handleMaturePayout = async (payoutId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to mature this payout? This action will mark it as processed and update the investment timeline."
        );

        if (!confirmed) return;

        setMaturingPayoutId(payoutId);

        try {
            const result = await maturePayout({ id: payoutId }).unwrap();
            toast.success(result.message || "Payout matured successfully");
            refetch(); // Refresh the table
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to mature payout");
        } finally {
            setMaturingPayoutId(null);
        }
    };



    const payouts = payoutsData?.data || [];

    // Filter payouts based on search term
    const filteredPayouts = payouts.filter((item: any) =>
        item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.amount?.toString().includes(searchTerm) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Client-side pagination logic (since the API returns all data for the range)
    const totalItems = filteredPayouts.length;
    const lastPage = Math.ceil(totalItems / perPage) || 1;
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalItems);
    const displayedPayouts = filteredPayouts.slice((currentPage - 1) * perPage, currentPage * perPage);

    const columns = [
        {
            key: "id",
            label: "ID",
            render: (item: any) => <span className="text-muted-foreground">#{item.id}</span>,
        },
        {
            key: "user",
            label: "User",
            render: (item: any) => (
                <div>
                    <p className="font-medium">{item.user?.name || `User #${item.user_id}`}</p>
                    <p className="text-xs text-muted-foreground">{item.user?.email}</p>
                </div>
            )
        },
        {
            key: "amount",
            label: "Amount",
            render: (item: any) => (
                <span className="font-bold text-foreground">₹{Number(item.amount).toLocaleString("en-IN")}</span>
            ),
        },
        {
            key: "net_amount",
            label: "Net Amount",
            render: (item: any) => (
                <span className="font-bold text-green-600">₹{Number(item.net_amount || 0).toLocaleString("en-IN")}</span>
            ),
        },
        {
            key: "type",
            label: "Type",
            render: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${item.type === 'roi' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                    }`}>
                    {item.type}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Paid' || item.status === 'Approved'
                    ? 'bg-green-500/10 text-green-600'
                    : item.status === 'Processing'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-gray-500/10 text-gray-600'
                    }`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: "payout_date",
            label: "Payout Date",
            render: (item: any) => <FormattedDate date={item.payout_date} />,
        },
        {
            key: "actions",
            label: "Actions",
            render: (item: any) => {
                const canMature = item.status === 'Unmatured' || item.status === 'Processing';
                const isMaturing = maturingPayoutId === item.id;

                if (!canMature) return <span className="text-xs text-muted-foreground">-</span>;

                return (
                    <Button
                        onClick={() => handleMaturePayout(item.id)}
                        disabled={isMaturing || isMaturingPayout}
                        size="sm"
                        variant="default"
                        className="h-8 px-3 text-xs"
                    >
                        {isMaturing ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mature
                            </>
                        )}
                    </Button>
                );
            },
        },
    ];



    const totalAmount = filteredPayouts.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalNetAmount = filteredPayouts.reduce((sum, item) => sum + Number(item.net_amount || 0), 0);

    const allUsers = usersData?.data?.data || [];
    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(userSearchText.toLowerCase())
    );
    const selectedUserName = userId ? allUsers.find(u => u.id === Number(userId))?.name : "All Users";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                        Payout Reports
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Generate payout reports by date range</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative z-50">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Select User (Optional)</label>
                        <div className="relative">
                            <div
                                className="w-full pl-3 pr-10 py-2 bg-background border border-border rounded-lg cursor-pointer flex items-center justify-between hover:border-primary/50 transition-colors"
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            >
                                <span className={`truncate text-sm ${!userId ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                                    {selectedUserName}
                                </span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground opacity-70" />
                            </div>

                            {isUserDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)}></div>
                                    <div className="absolute z-20 top-full left-0 w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 border-b border-border sticky top-0 bg-card">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search users..."
                                                    value={userSearchText}
                                                    onChange={(e) => setUserSearchText(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/70"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-1 space-y-0.5 custom-scrollbar">
                                            <div
                                                className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors ${userId === "" ? "bg-accent/50 text-accent-foreground font-medium" : "text-muted-foreground"}`}
                                                onClick={() => {
                                                    setUserId("");
                                                    setIsUserDropdownOpen(false);
                                                }}
                                            >
                                                All Users
                                                {userId === "" && <Check className="w-4 h-4 text-primary" />}
                                            </div>
                                            {filteredUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors ${Number(userId) === user.id ? "bg-accent/50 text-accent-foreground font-medium" : "text-muted-foreground"}`}
                                                    onClick={() => {
                                                        setUserId(user.id.toString());
                                                        setIsUserDropdownOpen(false);
                                                    }}
                                                >
                                                    {user.name}
                                                    {Number(userId) === user.id && <Check className="w-4 h-4 text-primary" />}
                                                </div>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <div className="px-3 py-8 text-sm text-center text-muted-foreground flex flex-col items-center gap-2">
                                                    <Search className="w-8 h-8 opacity-20" />
                                                    <span>No users found</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full md:w-auto"
                    >
                        <Search size={18} className="mr-2" />
                        Generate Report
                    </Button>
                </form>
            </div>

            {isSearchTriggered && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">Total Payouts</p>
                            <p className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">Total Net Payouts</p>
                            <p className="text-2xl font-bold text-green-600">₹{totalNetAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                            <p className="text-2xl font-bold">{totalItems}</p>
                        </div>
                    </div>

                    <AdminTable
                        title="Payout History"
                        showSearch={true}
                        searchPlaceholder="Search by user, amount, or status..."
                        searchValue={searchTerm}
                        onSearchChange={(value) => {
                            setSearchTerm(value);
                            setCurrentPage(1);
                        }}
                        columns={columns}
                        data={displayedPayouts}
                        keyExtractor={(item) => item.id}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        emptyMessage={isLoading ? "Loading..." : "No payouts found for the selected range."}
                        currentPage={currentPage}
                        lastPage={lastPage}
                        from={from}
                        to={to}
                        total={totalItems}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={setPerPage}
                        hasNextPage={currentPage < lastPage}
                        hasPrevPage={currentPage > 1}
                        onRefresh={handleRefresh}
                    />
                </div>
            )}
        </div>
    );
}
