import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TableActionButtonProps {
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    variant?: 'primary' | 'destructive' | 'secondary' | 'success' | 'warning';
    disabled?: boolean;
    className?: string;
}

const variantStyles = {
    primary: "text-primary bg-primary/10 hover:bg-primary/20 hover:scale-105 border-primary/20",
    destructive: "text-destructive bg-destructive/10 hover:bg-destructive/20 hover:scale-105 border-destructive/20",
    secondary: "text-secondary-foreground bg-secondary/10 hover:bg-secondary/20 hover:scale-105 border-secondary/20",
    success: "text-green-600 bg-green-500/10 hover:bg-green-500/20 hover:scale-105 border-green-500/20",
    warning: "text-orange-600 bg-orange-500/10 hover:bg-orange-500/20 hover:scale-105 border-orange-500/20",
};

const TableActionButton: React.FC<TableActionButtonProps> = ({
    onClick,
    icon: Icon,
    label,
    variant = 'primary',
    disabled = false,
    className
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    disabled={disabled}
                    className={cn(
                        "p-2 rounded-lg border transition-all duration-200 flex items-center justify-center",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                        variantStyles[variant],
                        className
                    )}
                >
                    <Icon size={18} />
                </button>
            </TooltipTrigger>
            <TooltipContent className="top-20">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default TableActionButton;
