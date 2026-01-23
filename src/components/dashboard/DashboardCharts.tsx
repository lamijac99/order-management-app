"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import Box from "@mui/material/Box";

export default function DashboardCharts({
  histogram,
  line,
}: {
  histogram?: Array<{ label: string; count: number }>;
  line?: Array<{ date: string; count: number }>;
}) {
  if (histogram) {
    return (
      <Box sx={{ height: 240, width: "100%" }}>
        <ResponsiveContainer width={400} height={240}>
          <BarChart
            data={histogram}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 45,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              height={60}
              tickMargin={10}
            />

            <YAxis allowDecimals={false} width={32} />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  if (line) {
    return (
      <Box sx={{ height: 210, width: "100%" }}>
        <ResponsiveContainer width={400} height={210}>
          <LineChart
            data={line}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            <YAxis allowDecimals={false} width={32} />
            <Tooltip />
            <Line type="monotone" dataKey="count" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  return null;
}
