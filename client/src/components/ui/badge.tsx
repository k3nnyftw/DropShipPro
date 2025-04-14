import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary bg-opacity-10 text-primary-foreground",
        secondary: "bg-secondary bg-opacity-10 text-secondary-foreground",
        destructive: "bg-destructive bg-opacity-10 text-destructive-foreground",
        outline: "border border-input bg-background text-foreground",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        purple: "bg-purple-100 text-purple-800",
        orange: "bg-orange-100 text-orange-800",
        gray: "bg-gray-100 text-gray-800",
      },
      size: {
        default: "h-5 text-xs",
        sm: "h-4 text-xs",
        lg: "h-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
