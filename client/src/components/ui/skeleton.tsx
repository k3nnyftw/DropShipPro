import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Enhanced skeleton component for loading states
 * Can be used to create various shaped placeholders
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Skeleton card for product or content items
 */
function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="space-y-3">
        <Skeleton className="h-[125px] w-full rounded-md" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-[60px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for table rows
 */
function SkeletonTable({ rows = 5, columns = 4, className, ...props }: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      <div className="flex items-center gap-4 py-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 flex-1" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center gap-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard stats
 */
function SkeletonStats({ count = 4, className, ...props }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`stat-${i}`} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-2/3" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-4 w-[30px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a form with fields
 */
function SkeletonForm({ fields = 5, className, ...props }: SkeletonProps & { fields?: number }) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`field-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-[120px]" />
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable,
  SkeletonStats,
  SkeletonForm
};