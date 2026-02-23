"use client";

import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";

export type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";

const STATUS_LABEL: Record<OrderStatus, string> = {
  KREIRANA: "Kreirana",
  U_OBRADI: "U obradi",
  POSLATA: "Poslata",
  ISPORUCENA: "Isporučena",
  OTKAZANA: "Otkazana",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  KREIRANA: "hsl(210, 80%, 55%)",
  U_OBRADI: "hsl(38, 90%, 55%)",
  POSLATA: "hsl(145, 55%, 45%)",
  ISPORUCENA: "hsl(265, 75%, 60%)",
  OTKAZANA: "hsl(0, 80%, 55%)",
};

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "primary" | "secondary" }>(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: { variant: "primary" },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }: { primaryText: string; secondaryText: string }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

function fmtPct(n: number) {
  return `${Math.round(n)}%`;
}

export default function OrdersByStatusChart({
  countsByStatus,
  title = "Narudžbe po statusu",
}: {
  countsByStatus: Record<OrderStatus, number>;
  title?: string;
}) {
  const total = Object.values(countsByStatus).reduce((a, b) => a + b, 0);

  const statuses: OrderStatus[] = ["KREIRANA", "U_OBRADI", "POSLATA", "ISPORUCENA", "OTKAZANA"];

  const seriesData = statuses.map((s) => ({
    id: s,
    label: STATUS_LABEL[s],
    value: countsByStatus[s] ?? 0,
  }));

  const rows = statuses
    .map((s) => {
      const value = countsByStatus[s] ?? 0;
      const pct = total ? (value / total) * 100 : 0;
      return { status: s, label: STATUS_LABEL[s], value, pct, color: STATUS_COLOR[s] };
    })
    .sort((a, b) => b.value - a.value);

  const colors = statuses.map((s) => STATUS_COLOR[s]);

  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PieChart
            colors={colors}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[
              {
                data: seriesData,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { fade: "global", highlight: "item" },
              },
            ]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel primaryText={`${total}`} secondaryText="Ukupno" />
          </PieChart>
        </Box>

        {rows.map((r) => (
          <Stack key={r.status} direction="row" sx={{ alignItems: "center", gap: 2, pb: 2 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: r.color }} />

            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.label}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {r.value} • {fmtPct(r.pct)}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={r.pct}
                aria-label="Narudžbe po statusu"
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: r.color,
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}