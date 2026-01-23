"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import type { OrderStatus } from "@/app/orders/page";

type SortKey = "datum_desc" | "datum_asc" | "ukupno_desc" | "ukupno_asc" | "kupac_asc" | "kupac_desc";

export default function OrdersFilters({
  status,
  q,
  sort,
  showCustomerSearch = true,
}: {
  status: OrderStatus | "ALL";
  q: string;
  sort: SortKey;
  showCustomerSearch?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [localStatus, setLocalStatus] = useState<OrderStatus | "ALL">(status);
  const [localQ, setLocalQ] = useState(q);
  const [localSort, setLocalSort] = useState<SortKey>(sort);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams(sp.toString());
    p.delete("status");
    p.delete("q");
    p.delete("sort");
    p.delete("page");
    return p;
  }, [sp]);

  const apply = () => {
    const p = new URLSearchParams(baseParams);

    if (localStatus !== "ALL") p.set("status", localStatus);

    if (showCustomerSearch && localQ.trim()) p.set("q", localQ.trim());

    const safeSort =
      !showCustomerSearch && (localSort === "kupac_asc" || localSort === "kupac_desc")
        ? "datum_desc"
        : localSort;

    if (safeSort) p.set("sort", safeSort);

    p.set("page", "1");
    router.push(`/orders?${p.toString()}`);
  };

  const reset = () => {
    setLocalStatus("ALL");
    setLocalQ("");
    setLocalSort("datum_desc");
    router.push("/orders");
  };

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
      <TextField
        select
        size="small"
        label="Status"
        value={localStatus}
        onChange={(e) => setLocalStatus(e.target.value as any)}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="ALL">Svi</MenuItem>
        <MenuItem value="KREIRANA">KREIRANA</MenuItem>
        <MenuItem value="U_OBRADI">U_OBRADI</MenuItem>
        <MenuItem value="POSLATA">POSLATA</MenuItem>
        <MenuItem value="ISPORUCENA">ISPORUCENA</MenuItem>
        <MenuItem value="OTKAZANA">OTKAZANA</MenuItem>
      </TextField>

      {showCustomerSearch && (
        <TextField
          size="small"
          label="Pretraga kupca"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="npr. Marko"
          sx={{ minWidth: 240, flexGrow: 1 }}
        />
      )}

      <TextField
        select
        size="small"
        label="Sort"
        value={localSort}
        onChange={(e) => setLocalSort(e.target.value as SortKey)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="datum_desc">Datum (najnovije)</MenuItem>
        <MenuItem value="datum_asc">Datum (najstarije)</MenuItem>

        {showCustomerSearch ? <MenuItem value="kupac_asc">Kupac (A–Z)</MenuItem> : null}
        {showCustomerSearch ? <MenuItem value="kupac_desc">Kupac (Z–A)</MenuItem> : null}

        <MenuItem value="ukupno_desc">Ukupno (veće)</MenuItem>
        <MenuItem value="ukupno_asc">Ukupno (manje)</MenuItem>
      </TextField>

      <Button variant="contained" onClick={apply}>
        Primijeni
      </Button>
      <Button variant="text" onClick={reset}>
        Reset
      </Button>
    </Box>
  );
}
