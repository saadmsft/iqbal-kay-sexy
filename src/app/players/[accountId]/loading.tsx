import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Skeleton className="w-24 h-24 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        </div>
      </div>
      <Card><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
        <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
