import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
    center?: boolean;
}

const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
};

const Loader: React.FC<LoaderProps> = ({
    className,
    size = 'md',
    text,
    fullScreen = false,
    center = false
}) => {
    const iconSize = sizeMap[size];

    const content = (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <Loader2
                className={cn("animate-spin text-primary", className)}
                size={iconSize}
            />
            {text && (
                <p className="text-sm text-muted-foreground font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    if (center) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[100px]">
                {content}
            </div>
        );
    }

    return content;
};

export default Loader;
