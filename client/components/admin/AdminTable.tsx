import React, { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RefreshButton from '@/components/common/RefreshButton';
import Loader from '@/components/common/Loader';
import { PaginationControls } from './PaginationControls';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface AdminTableProps<T> {
    // Header props
    title: string;
    subtitle?: string;
    headerActions?: ReactNode;

    // Search props
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    showSearch?: boolean;

    // Filter props
    filterActions?: ReactNode;

    // Table props
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    isLoading?: boolean;
    isFetching?: boolean;
    emptyMessage?: string;

    // Pagination props
    currentPage: number;
    lastPage: number;
    from: number;
    to: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemName?: string;
    onRefresh?: () => void;
}

export function AdminTable<T>({
    // Header
    title,
    subtitle,
    headerActions,
    // Search
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    showSearch = true,

    // Filters
    filterActions,

    // Table
    columns,
    data,
    keyExtractor,
    isLoading = false,
    isFetching = false,
    emptyMessage = "No data found.",

    // Pagination
    currentPage,
    lastPage,
    from,
    to,
    total,
    perPage,
    onPageChange,
    onPerPageChange,
    hasNextPage,
    hasPrevPage,
    itemName = "items",
    onRefresh,
}: AdminTableProps<T>) {
    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                    )}
                </div>
                {headerActions && <div>{headerActions}</div>}
            </div>

            {/* Search & Filters Section */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                {showSearch && (
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {searchValue && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onSearchChange("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clear search</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <RefreshButton
                            onRefresh={onRefresh}
                            isRefreshing={isFetching}
                            label="Refresh"
                        />
                    )}
                    {filterActions}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative min-h-[400px]">


                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={`px-6 py-4 font-medium ${column.className || ''}`}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(isLoading || isFetching) ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12">
                                        <div className="flex items-center justify-center min-h-[400px]">
                                            <Loader text="Loading data..." />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.length > 0 ? (
                                    data.map((item) => (
                                        <tr
                                            key={keyExtractor(item)}
                                            className="hover:bg-muted/30 transition-colors border-b border-border"
                                        >
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className={`px-6 py-4 ${column.className || ''}`}
                                                >
                                                    {column.render
                                                        ? column.render(item)
                                                        : (item as any)[column.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-12 text-center text-muted-foreground"
                                        >
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination at bottom of table */}
                {data.length > 0 && (
                    <PaginationControls
                        currentPage={currentPage}
                        lastPage={lastPage}
                        from={from}
                        to={to}
                        total={total}
                        perPage={perPage}
                        onPageChange={onPageChange}
                        onPerPageChange={onPerPageChange}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        itemName={itemName}
                    />
                )}
            </div>
        </div>
    );
}
