"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  title?: string;
  description?: string;
}

export function ChartPie({
  data,
  colors = ["#4ade80", "#f87171"],
  title = "Voting Status",
  description = "Voted vs Not Voted"
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const percentage = (value: number) => total > 0 ? ((value / total) * 100).toFixed(0) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Tooltip formatter={(value: number) => [`${value}`, "Votes"]} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${percentage(value)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </RePieChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex w-full items-start flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Total Votes Considered: {total} <TrendingUp className="h-4 w-4" />
        </div>
        {data.length > 0 && (
          <div className="text-muted-foreground">
            {data.map(d => `${d.name}: ${d.value} votes`).join(" | ")}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
