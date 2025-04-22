import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { getAllUsers } from "@/Api_Requests/Api_Requests";
import { useEffect, useState } from "react";

/**
 * @typedef {Object} ChartDataItem
 * @property {string} date
 * @property {number} totalNewUsers
 */

const chartConfig = {
  totalNewUsers: { label: "New Users", color: "hsl(var(--chart-1))" },
};

export function AdminCurrentMonthStats() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalNewUsers, setTotalNewUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    const fetchAndProcessUsers = async () => {
      try {
        setIsLoading(true);
        const usersResponse = await getAllUsers();
        const users = usersResponse.data || [];
        if (users.length) setTotalUsers(users.length);

        // Get dates for the last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Filter users who joined in the last 30 days
        const recentUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= thirtyDaysAgo;
        });

        // Group users by date
        const usersByDate = {};

        // Initialize all dates in the last 30 days with zero counts
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          usersByDate[dateString] = 0;
        }

        // Count users for each date
        recentUsers.forEach(user => {
          const dateCreated = new Date(user.createdAt).toISOString().split('T')[0];
          if (usersByDate[dateCreated] !== undefined) {
            usersByDate[dateCreated]++;
          }
        });

        // Convert to array format for the chart
        const formattedData = Object.keys(usersByDate)
          .sort() // Sort dates in ascending order
          .map(date => ({
            date,
            totalNewUsers: usersByDate[date]
          }));

        // Calculate total new users in last 30 days
        const totalNewUsers = recentUsers.length;
        setTotalNewUsers(totalNewUsers);

        // Calculate growth rate (simplified)
        // Compare users in first 15 days vs last 15 days
        const firstHalfUsers = formattedData.slice(0, 15).reduce((sum, item) => sum + item.totalNewUsers, 0);
        const secondHalfUsers = formattedData.slice(15, 30).reduce((sum, item) => sum + item.totalNewUsers, 0);

        if (firstHalfUsers > 0) {
          const growth = ((secondHalfUsers - firstHalfUsers) / firstHalfUsers) * 100;
          setGrowthRate(growth.toFixed(1));
        }

        setChartData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.log("Error fetching users", error);
        setIsLoading(false);
      }
    };

    fetchAndProcessUsers();
  }, []);

  return (
    <div className="dark">
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-b-gray-900 p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>User Statistics - Last 30 Days</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <div className="flex">
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-gray-900 px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground">
                {chartConfig.totalNewUsers.label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {isLoading ? "Loading..." : totalNewUsers.toLocaleString()}
              </span>
            </div>
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-gray-900 px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Total Users
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {isLoading ? "Loading..." : totalUsers}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[250px]">Loading chart data...</div>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    />
                  }
                />
                <Bar dataKey="totalNewUsers" fill="var(--color-totalNewUsers)" radius={6} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {growthRate > 0 ? (
              <>Growing up by {growthRate}% in last 30 days <TrendingUp className="h-4 w-4" /></>
            ) : (
              <>Down by {Math.abs(growthRate)}% in last 30 days </>
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            Showing new user registrations for the last 30 days
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}