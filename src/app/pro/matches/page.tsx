import { getProMatches } from "@/lib/opendota";
import { MatchSummary } from "@/components/match-summary";
import { Gamepad2 } from "lucide-react";

export const revalidate = 300;

export const metadata = {
  title: "Pro Matches - Iqbal Kay Sexy",
  description: "Recent professional Dota 2 match results.",
};

export default async function ProMatchesPage() {
  const matches = await getProMatches();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          Pro Matches
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Latest professional match results
        </p>
      </div>
      <div className="space-y-2">
        {matches.slice(0, 50).map((match) => (
          <MatchSummary key={match.match_id} match={match} />
        ))}
      </div>
    </div>
  );
}
