"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "A bar chart showing requests per team or category"

// Master data structure
const teamData: Record<string, { name: string; requests: number }[]> = {
  Engineering: [
    { name: "Laptops", requests: 65 },
    { name: "Monitors", requests: 45 },
    { name: "Peripherals", requests: 20 },
    { name: "Licenses", requests: 15 },
  ],
  Design: [
    { name: "Laptops", requests: 25 },
    { name: "Monitors", requests: 40 },
    { name: "Tablets", requests: 15 },
    { name: "Software", requests: 9 },
  ],
  Product: [
    { name: "Laptops", requests: 30 },
    { name: "Tablets", requests: 20 },
    { name: "Mobile", requests: 17 },
  ],
  Marketing: [
    { name: "Laptops", requests: 20 },
    { name: "Ads Budget", requests: 15 },
    { name: "Software", requests: 10 },
  ],
  Sales: [
    { name: "Laptops", requests: 15 },
    { name: "Mobile", requests: 10 },
    { name: "Travel", requests: 7 },
  ],
  HR: [
    { name: "Laptops", requests: 10 },
    { name: "Furniture", requests: 8 },
    { name: "Stationery", requests: 3 },
  ],
}

// Calculate total requests per team for the "All Teams" view
const allTeamsData = Object.entries(teamData).map(([team, categories]) => ({
  name: team,
  requests: categories.reduce((acc, curr) => acc + curr.requests, 0),
}))

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [selectedTeam, setSelectedTeam] = React.useState<string>("all")
  
  const chartData = selectedTeam === "all" 
    ? allTeamsData 
    : teamData[selectedTeam] || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Request Distribution</CardTitle>
          <CardDescription>
            {selectedTeam === "all" ? "Total requests per Team" : `Category breakdown for ${selectedTeam}`}
          </CardDescription>
        </div>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {Object.keys(teamData).map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="requests"
              fill="var(--color-requests)"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
