"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface WinRateByBracketChartProps {
  data: { bracket: string; winRate: number; picks: number }[];
}

export function WinRateByBracketChart({ data }: WinRateByBracketChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="bracket"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          domain={[40, 60]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)",
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Win Rate"]}
        />
        <Bar
          dataKey="winRate"
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DurationWinRateChartProps {
  data: { duration: string; winRate: number; games: number }[];
}

export function DurationWinRateChart({ data }: DurationWinRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="duration"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          domain={[30, 70]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)",
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Win Rate"]}
        />
        <Line
          type="monotone"
          dataKey="winRate"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--primary)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface GoldXpAdvantageChartProps {
  goldAdv: number[];
  xpAdv: number[];
}

export function GoldXpAdvantageChart({
  goldAdv,
  xpAdv,
}: GoldXpAdvantageChartProps) {
  const data = goldAdv.map((g, i) => ({
    minute: i,
    gold: g,
    xp: xpAdv[i] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="minute"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          label={{
            value: "Minutes",
            position: "insideBottomRight",
            offset: -5,
            fill: "var(--muted-foreground)",
            fontSize: 11,
          }}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="gold"
          stroke="#f5c542"
          fill="#f5c54220"
          strokeWidth={2}
          name="Gold Adv."
        />
        <Area
          type="monotone"
          dataKey="xp"
          stroke="#5b9bd5"
          fill="#5b9bd520"
          strokeWidth={2}
          name="XP Adv."
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
