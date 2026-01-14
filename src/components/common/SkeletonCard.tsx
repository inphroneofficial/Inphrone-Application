import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface SkeletonCardProps {
  variant?: "stat" | "category" | "opinion" | "profile" | "list-item";
}

export function SkeletonCard({ variant = "stat" }: SkeletonCardProps) {
  if (variant === "stat") {
    return (
      <Card className="p-4 md:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </Card>
    );
  }

  if (variant === "category") {
    return (
      <Card className="p-6 space-y-3 text-center">
        <Skeleton className="w-12 h-12 rounded-xl mx-auto" />
        <Skeleton className="h-4 w-16 mx-auto" />
        <Skeleton className="h-5 w-20 mx-auto rounded-full" />
      </Card>
    );
  }

  if (variant === "opinion") {
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </Card>
    );
  }

  if (variant === "profile") {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </Card>
    );
  }

  if (variant === "list-item") {
    return (
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-12" />
      </div>
    );
  }

  return null;
}

export function SkeletonList({ count = 5, variant = "list-item" }: { count?: number; variant?: SkeletonCardProps["variant"] }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}
