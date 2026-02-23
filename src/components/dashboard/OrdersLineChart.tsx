"use client";

import * as React from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";

type Point = { date: string; count: number };

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function pctChange(prev: number, cur: number) {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
}

export default function OrdersLineChart({
  data,
  title = "Narudžbe po danima",
  subtitle = "Zadnjih 30 dana",
}: {
  data: Point[];
  title?: string;
  subtitle?: string;
}) {
  const theme = useTheme();

  const chartHeight = 220;

  // template-like labels: "Apr 5"
  const x = React.useMemo(() => {
    return (data ?? []).map((d) => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
  }, [data]);

  const y = React.useMemo(() => (data ?? []).map((d) => Number(d.count ?? 0)), [data]);
  const total = React.useMemo(() => y.reduce((a, b) => a + b, 0), [y]);

  // trend: last 7 vs prev 7
  const last7 = React.useMemo(() => y.slice(-7).reduce((a, b) => a + b, 0), [y]);
  const prev7 = React.useMemo(() => y.slice(-14, -7).reduce((a, b) => a + b, 0), [y]);
  const delta = React.useMemo(() => pctChange(prev7, last7), [prev7, last7]);

  const trendUp = delta >= 0;
  const chipLabel = `${trendUp ? "+" : ""}${delta.toFixed(0)}%`;

  const chipMain = trendUp ? theme.palette.success.main : theme.palette.error.main;
  const chipText = trendUp ? theme.palette.success.dark : theme.palette.error.dark;

  const lineColor = theme.palette.primary.main;
  const gradId = "ordersLine";

  // template-ish strokes
  const axisStroke = alpha(theme.palette.text.secondary, 0.6);
  const tickStroke = alpha(theme.palette.text.secondary, 0.4);
  const gridStroke = alpha(theme.palette.text.secondary, 0.25);

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        bgcolor: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>

        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {total}
            </Typography>

            <Chip
              size="small"
              label={chipLabel}
              sx={{
                fontWeight: 600,
                height: 26,
                borderRadius: 999,
                bgcolor: alpha(chipMain, 0.12),
                color: chipText,
                border: `1px solid ${alpha(chipMain, 0.25)}`,
              }}
            />
          </Stack>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {subtitle}
          </Typography>
        </Stack>

        {/* FIX: isti chart box kao histogram */}
        <Box sx={{ mt: 1, height: chartHeight }}>
          <LineChart
            colors={[lineColor]}
            xAxis={[
              {
                scaleType: "point",
                data: x,
                tickInterval: (_index, i) => (i + 1) % 5 === 0,
                height: 24,
              },
            ]}
            yAxis={[{ width: 50 }]}
            series={[
              {
                id: "orders",
                label: "Narudžbe",
                data: y,
                showMark: false,
                curve: "linear",
                area: true,
              },
            ]}
            height={chartHeight}
            margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
            grid={{ horizontal: true }}
            hideLegend
            sx={{
              "& .MuiAreaElement-series-orders": { fill: `url('#${gradId}')` },

              "& .MuiChartsGrid-line": {
                strokeDasharray: "4 4",
                stroke: gridStroke,
              },

              "& .MuiChartsAxis-tickLabel": { fill: theme.palette.text.secondary },
              "& .MuiChartsAxis-label": { fill: theme.palette.text.secondary },

              "& .MuiChartsAxis-line": { stroke: axisStroke, strokeWidth: 1 },
              "& .MuiChartsAxis-tick": { stroke: tickStroke },
            }}
          >
            <AreaGradient color={theme.palette.primary.main} id={gradId} />
          </LineChart>
        </Box>
      </CardContent>
    </Card>
  );
}