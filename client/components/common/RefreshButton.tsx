import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RefreshButtonProps {
    onRefresh: () => void;
    isRefreshing: boolean;
    className?: string;
    label?: string;
    tooltip?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
    onRefresh,
    isRefreshing,
    className,
    label,
    tooltip = "Refresh Data"
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size={label ? "default" : "icon"}
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className={cn("transition-all duration-300 hover:bg-muted group cursor-pointer", className)}
                >
                    <RefreshCw
                        size={18}
                        className={cn(
                            "transition-all duration-700",
                            isRefreshing ? "animate-spin text-primary" : ""
                        )}
                    />
                    {label && <span className="ml-2">{label}</span>}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default RefreshButton;
