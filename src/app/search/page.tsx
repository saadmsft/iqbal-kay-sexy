"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { SearchResult } from "@/types/opendota";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `https://api.opendota.com/api/search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SearchIcon className="h-6 w-6 text-primary" />
          Player Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search for players by their Steam name
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Enter player name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-base"
          autoFocus
        />
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No players found for &ldquo;{query}&rdquo;
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <Link key={r.account_id} href={`/players/${r.account_id}`}>
              <Card className="transition-all hover:ring-1 hover:ring-primary/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {r.avatarfull ? (
                      <Image
                        src={r.avatarfull}
                        alt={r.personaname}
                        width={40}
                        height={40}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {r.personaname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.last_match_time
                          ? `Last match: ${new Date(r.last_match_time).toLocaleDateString()}`
                          : "No recent matches"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      ID: {r.account_id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Start typing to search for players</p>
        </div>
      )}
    </div>
  );
}
