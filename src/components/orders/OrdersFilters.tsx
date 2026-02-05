"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import type { OrderStatus } from "@/app/orders/page";

export default function OrdersFilters({
  status,
  q,
  showCustomerSearch = true,
}: {
  status: OrderStatus | "ALL";
  q: string;
  showCustomerSearch?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [localStatus, setLocalStatus] = useState<OrderStatus | "ALL">(status);
  const [localQ, setLocalQ] = useState(q);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams(sp.toString());
    p.delete("status");
    p.delete("q");
    p.delete("page");
    return p;
  }, [sp]);

  const apply = () => {
    const p = new URLSearchParams(baseParams);

    if (localStatus !== "ALL") p.set("status", localStatus);

    if (showCustomerSearch && localQ.trim()) p.set("q", localQ.trim());

    p.set("page", "1");
    router.push(`/orders?${p.toString()}`);
  };

  const reset = () => {
    setLocalStatus("ALL");
    setLocalQ("");
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
          label="Pretraga"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="kupac, adresa ili proizvod"
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
      )}

      <Button variant="contained" onClick={apply}>
        Primijeni
      </Button>
      <Button variant="text" onClick={reset}>
        Reset
      </Button>
    </Box>
  );
}