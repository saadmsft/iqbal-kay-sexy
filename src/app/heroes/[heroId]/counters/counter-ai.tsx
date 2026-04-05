"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";

interface CounterAiProps {
  heroDataJson: string;
  heroName: string;
}

export function CounterAiAnalysis({ heroDataJson, heroName }: CounterAiProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/counter-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroData: heroDataJson }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data.analysis || "Analysis unavailable.");
      })
      .catch(() => {
        setAnalysis("AI analysis temporarily unavailable.");
      })
      .finally(() => setLoading(false));
  }, [heroDataJson]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Counter Analysis — {heroName}
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
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
            <MarkdownContent content={analysis || ""} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
