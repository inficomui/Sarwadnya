import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "danger" | "warning" | "info"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
    as?: React.ElementType
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, as, isLoading = false, children, disabled, ...props }, ref) => {
        // Enhanced variant mapping with professional styles
        const variants = {
            default: "bg-primary text-primary-foreground hover:brightness-110 shadow-lg hover:shadow-primary/25 border border-primary/20",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-destructive/25",
            outline: "border border-border bg-background hover:bg-muted text-foreground/80",
            secondary: "bg-muted text-foreground hover:bg-muted/80 border border-border",
            ghost: "hover:bg-muted text-foreground/80",
            link: "text-primary underline-offset-4 hover:underline",
            success: "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:hover:bg-green-500/30 border border-green-500/20 shadow-sm hover:shadow-green-500/10",
            danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-500/20 shadow-sm hover:shadow-red-500/10",
            warning: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/30 border border-yellow-500/20 shadow-sm hover:shadow-yellow-500/10",
            info: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 border border-blue-500/20 shadow-sm hover:shadow-blue-500/10",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-8 text-base",
            icon: "h-10 w-10",
        }

        // Combine classes
        const variantClass = variants[variant] || variants.default
        const sizeClass = sizes[size] || sizes.default

        // Core base styles with enhanced transitions
        const baseClass = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"

        const Comp = as || "button"

        return (
            <Comp
                className={cn(baseClass, variantClass, sizeClass, className)}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {children}
                    </>
                ) : (
                    children
                )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button }
