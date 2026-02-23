"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function CardAlert({ createdCount }: { createdCount: number }) {
  const n = Number(createdCount || 0);

  const title = n === 0 ? "Sve je pod kontrolom" : "Čekaju na obradu";
  const desc =
    n === 0
      ? "Trenutno nema novo-kreiranih narudžbi koje čekaju sljedeći korak."
      : `Imaš ${n} ${n === 1 ? "narudžbu" : n >= 2 && n <= 4 ? "narudžbe" : "narudžbi"} u statusu KREIRANA — spremne su za obradu.`;

  return (
    <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0 }}>
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 700, mt: 0.5 }}>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {desc}
        </Typography>

        <Button
          component={Link}
          href="/orders"
          variant="contained"
          size="small"
          fullWidth
          disabled={n === 0}
        >
          Pregledaj narudžbe
        </Button>
      </CardContent>
    </Card>
  );
}