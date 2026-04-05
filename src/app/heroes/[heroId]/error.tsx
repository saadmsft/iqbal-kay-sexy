"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Failed to load hero
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "Could not load hero data. The hero may not exist."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Link href="/heroes">
              <Button variant="secondary">Back to Heroes</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
