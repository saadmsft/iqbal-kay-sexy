import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/opendota";
import type { ProMatch } from "@/types/opendota";
import { formatDistanceToNow } from "date-fns";

interface MatchSummaryProps {
  match: ProMatch;
  compact?: boolean;
}

export function MatchSummary({ match, compact = false }: MatchSummaryProps) {
  const timeAgo = formatDistanceToNow(new Date(match.start_time * 1000), {
    addSuffix: true,
  });

  return (
    <Link href={`/matches/${match.match_id}`}>
      <Card className="transition-all hover:ring-1 hover:ring-primary/50">
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={`text-sm font-semibold truncate ${
                  match.radiant_win ? "text-green-400" : "text-foreground"
                }`}
              >
                {match.radiant_name || "Radiant"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {match.radiant_score}
              </span>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {formatDuration(match.duration)}
            </Badge>
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <span className="text-xs text-muted-foreground font-mono">
                {match.dire_score}
              </span>
              <span
                className={`text-sm font-semibold truncate ${
                  !match.radiant_win ? "text-green-400" : "text-foreground"
                }`}
              >
                {match.dire_name || "Dire"}
              </span>
            </div>
          </div>
          {!compact && (
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{match.league_name}</span>
              <span>{timeAgo}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
