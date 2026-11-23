import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-100 text-slate-800",
        secondary:
          "border-transparent bg-clinical-lightteal text-clinical-teal",
        normal:
          "border border-status-normal-border bg-status-normal-bg text-status-normal-text",
        warning:
          "border border-status-warning-border bg-status-warning-bg text-status-warning-text",
        abnormal:
          "border border-status-abnormal-border bg-status-abnormal-bg text-status-abnormal-text",
        outline: "text-foreground border border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
            "bg-status-normal-dot": variant === "normal",
            "bg-status-warning-dot": variant === "warning",
            "bg-status-abnormal-dot": variant === "abnormal",
            "bg-slate-500": variant === "default" || variant === "outline",
            "bg-clinical-teal": variant === "secondary",
          })}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
