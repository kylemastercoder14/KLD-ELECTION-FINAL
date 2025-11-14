/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ChartAreaProps {
  data: any[];
  dataKey: string; // key for values, e.g., "voted"
  nameKey: string; // key for X-axis, e.g., "date"
  title?: string;
  description?: string;
  color?: string; // primary color for the area
}

export function ChartArea({
  data,
  dataKey,
  nameKey,
  title = "Participation Trend",
  description = "Votes cast over time",
  color = "#4ade80"
}: ChartAreaProps) {
  const total = data.reduce((sum, d) => sum + d[dataKey], 0);

  const gradientId = `gradient-${dataKey.replace(/\s+/g, "")}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 12, left: 12, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradientId})`}
              fillOpacity={0.4}
              stackId="a"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Total Votes Considered: {total} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {data.length > 0 && `${data[0][nameKey]} - ${data[data.length - 1][nameKey]}`}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
