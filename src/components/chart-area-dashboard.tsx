"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { LineChart } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface MonthlyUserData {
  name: string;
  users: number;
}

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ChartAreaDashboard() {
  const [monthlyUsersData, setMonthlyUsersData] = React.useState<
    MonthlyUserData[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMonthlyUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/monthly");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MonthlyUserData[] = await response.json();
      setMonthlyUsersData(data);
    } catch (error) {
      console.error("Failed to fetch monthly user data:", error);
      setError("Failed to load chart data");
      setMonthlyUsersData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMonthlyUsers();
  }, []);

  // Calculate max value for better Y-axis scaling
  const maxUsers = React.useMemo(() => {
    if (monthlyUsersData.length === 0) return 5;
    const max = Math.max(...monthlyUsersData.map((d) => d.users));
    return Math.max(max + 1, 5); // Ensure minimum scale of 5
  }, [monthlyUsersData]);

  if (loading) {
    return (
      <Card className="@container/card mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-muted-foreground" />
            User Registrations
          </CardTitle>
          <CardDescription>
            Monthly user registration trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="@container/card mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-muted-foreground" />
            User Registrations
          </CardTitle>
          <CardDescription>
            Monthly user registration trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <LineChart className="h-5 w-5 text-muted-foreground" />
          User Registrations
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Monthly user registration trends over the last 6 months
          </span>
          <span className="@[540px]/card:hidden">Last 6 months</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {monthlyUsersData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart
              data={monthlyUsersData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-users)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-users)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                fontSize={12}
              />
              {/* <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                allowDecimals={false}
                domain={[0, maxUsers]}
                tickCount={Math.min(maxUsers + 1, 6)}
              /> */}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Month: ${value}`}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="users"
                type="monotone"
                fill="url(#fillUsers)"
                fillOpacity={0.6}
                stroke="var(--color-users)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <p>No user registration data available for the selected period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
