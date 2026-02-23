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

type Item = { naziv: string; count: number; komada: number };

const COLORS5 = [
  "hsl(220, 20%, 65%)",
  "hsl(220, 20%, 42%)",
  "hsl(220, 20%, 30%)",
  "hsl(220, 20%, 22%)",
  "hsl(220, 20%, 16%)",
];

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

export default function TopProductsDonut({
  items,
  title = "Top proizvodi",
}: {
  items: Item[];
  title?: string;
}) {
  // ✅ uvijek prikazi max 5 proizvoda
  const top5 = React.useMemo(() => (items ?? []).slice(0, 5), [items]);

  const total = top5.reduce((a, b) => a + (Number(b.count) || 0), 0);
  const max = Math.max(1, ...top5.map((x) => Number(x.count) || 0));

  // boje za pie + listu (uvijek imaju vrijednost)
  const colors = top5.map((_, i) => COLORS5[i] ?? COLORS5[COLORS5.length - 1]);

  const seriesData = top5.map((p) => ({
    id: p.naziv,
    label: p.naziv,
    value: Number(p.count) || 0,
  }));

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

        {top5.map((p, i) => {
          const value = Number(p.count) || 0;
          const pct = total ? (value / total) * 100 : 0;
          const pctOfMax = (value / max) * 100;
          const color = colors[i];

          return (
            <Stack key={`${p.naziv}-${i}`} direction="row" sx={{ alignItems: "center", gap: 2, pb: 2 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: color }} />

              <Stack sx={{ gap: 1, flexGrow: 1 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {p.naziv}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {value} • {fmtPct(pct)}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={pctOfMax}
                  aria-label="Top proizvodi"
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "rgba(0,0,0,0.10)",
                    [`& .${linearProgressClasses.bar}`]: {
                      backgroundColor: color,
                      borderRadius: 999,
                    },
                  }}
                />
              </Stack>
            </Stack>
          );
        })}

        {top5.length === 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Nema podataka.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}