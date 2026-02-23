"use client";

import * as React from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

type Bucket = { label: string; count: number };

function pctChange(prev: number, cur: number) {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
}

export default function OrdersHistogramChart({
  data,
  title = "Vrijednost narudžbi",
  subtitle = "Zadnjih 200 narudžbi",
}: {
  data: Bucket[];
  title?: string;
  subtitle?: string;
}) {
  const theme = useTheme();

  const chartHeight = 220;

  const labels = React.useMemo(() => data.map((d) => d.label), [data]);
  const counts = React.useMemo(() => data.map((d) => Number(d.count ?? 0)), [data]);
  const total = React.useMemo(() => counts.reduce((a, b) => a + b, 0), [counts]);

  const half = Math.floor(counts.length / 2);
  const prev = React.useMemo(() => counts.slice(0, half).reduce((a, b) => a + b, 0), [counts, half]);
  const cur = React.useMemo(() => counts.slice(half).reduce((a, b) => a + b, 0), [counts, half]);

  const delta = React.useMemo(() => pctChange(prev, cur), [prev, cur]);
  const trendUp = delta >= 0;
  const chipLabel = `${trendUp ? "+" : ""}${delta.toFixed(0)}%`;

  const chipMain = trendUp ? theme.palette.success.main : theme.palette.error.main;
  const chipText = trendUp ? theme.palette.success.dark : theme.palette.error.dark;

  const barColor = theme.palette.primary.main;

  const axisStroke = alpha(theme.palette.text.secondary, 0.6);
  const tickStroke = alpha(theme.palette.text.secondary, 0.4);
  const gridStroke = alpha(theme.palette.text.secondary, 0.25);

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
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

        <Box sx={{ mt: 1, height: chartHeight }}>
          <BarChart
            height={chartHeight}
            margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
            xAxis={[
              {
                scaleType: "band",
                data: labels,
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            yAxis={[
              {
                width: 50,
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            series={[
              {
                data: counts,
                label: "Narudžbe",
                color: barColor,
              } as any,
            ]}
            grid={{ horizontal: true }}
            hideLegend
            sx={{
              "& .MuiChartsGrid-line": {
                strokeDasharray: "4 4",
                stroke: gridStroke,
              },

              "& .MuiChartsAxis-tickLabel": {
                fill: theme.palette.text.secondary,
                whiteSpace: "nowrap",
              },
              "& .MuiChartsAxis-label": {
                fill: theme.palette.text.secondary,
              },

              "& .MuiChartsAxis-line": {
                stroke: axisStroke,
                strokeWidth: 1,
              },
              "& .MuiChartsAxis-tick": {
                stroke: tickStroke,
              },

              /**
               * ✅ ONLY TOP ROUNDED
               * Ne koristi rx/ry jer oni zaobljuju i dole.
               */
              "& .MuiBarElement-root, & .MuiChartsBar-root": {
                clipPath: "inset(0 round 10px 10px 0px 0px)",
                filter: `drop-shadow(0px 1px 0px ${alpha(
                  theme.palette.common.black,
                  0.06
                )})`,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}