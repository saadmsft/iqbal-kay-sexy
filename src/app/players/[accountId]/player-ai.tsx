"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";

interface PlayerAiInsightProps {
  playerDataJson: string;
  playerName: string;
}

export function PlayerAiInsight({ playerDataJson, playerName }: PlayerAiInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/player-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerData: playerDataJson }),
    })
      .then((res) => res.json())
      .then((data) => setInsight(data.insight || "Analysis unavailable."))
      .catch(() => setInsight("AI analysis temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [playerDataJson]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insight — {playerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
            <MarkdownContent content={insight || ""} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
