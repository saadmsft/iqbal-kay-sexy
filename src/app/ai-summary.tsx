"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";

interface AiSummarySectionProps {
  heroStatsJson: string;
}

export function AiSummarySection({ heroStatsJson }: AiSummarySectionProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/meta-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroStats: heroStatsJson }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary || "Analysis unavailable.");
      })
      .catch(() => {
        setSummary("AI analysis temporarily unavailable. Check back later.");
      })
      .finally(() => setLoading(false));
  }, [heroStatsJson]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Meta Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
            <MarkdownContent content={summary || ""} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
