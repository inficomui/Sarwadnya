import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
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
    itemName?: string; // e.g., "users", "deposits", "transfers"
}

export function PaginationControls({
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
    itemName = 'items'
}: PaginationControlsProps) {
    const rowOptions = [5, 10, 15, 20, 25, 50, 100];

    return (
        <div className="px-6 py-4 border-t border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Showing info */}
                <div className="text-xs text-muted-foreground font-medium">
                    Showing <span className="text-foreground font-bold">{from || 0}</span>-
                    <span className="text-foreground font-bold">{to || 0}</span> of{' '}
                    <span className="text-foreground font-bold">{total}</span> {itemName}
                </div>

                {/* Center: Rows per page selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Rows per page:</span>
                    <select
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-muted"
                    >
                        {rowOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Right: Navigation buttons */}
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                        Page <span className="text-foreground font-bold">{currentPage}</span> of{' '}
                        <span className="text-foreground font-bold">{lastPage}</span>
                    </span>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={!hasPrevPage}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                        >
                            <ChevronLeft className="w-3 h-3" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>
                        <Button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={!hasNextPage}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
