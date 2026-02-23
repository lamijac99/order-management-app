"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

import type { LogRow } from "@/app/logs/page";

function actionColors(akcija: string) {
  const a = String(akcija ?? "").toUpperCase();
  if (a.includes("DELETE") || a.includes("OBRIS")) return { label: akcija, bg: "#f44336", color: "#f44336" };
  if (a.includes("STATUS") || a.includes("UPDATE") || a.includes("EDIT") || a.includes("IZMIJ"))
    return { label: akcija, bg: "#ff9800", color: "#ff9800" };
  if (a.includes("CREATE") || a.includes("KREIR")) return { label: akcija, bg: "#4caf50", color: "#4caf50" };
  return { label: akcija, bg: "#9e9e9e", color: "#9e9e9e" };
}

function formatDateOnly(value: unknown) {
  const s = String(value ?? "");
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    return s.split("T")[0] ?? s;
  }
  return d.toLocaleDateString("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function LogsTable({ rows }: { rows: LogRow[] }) {
  const router = useRouter();

  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const columns: GridColDef<LogRow>[] = React.useMemo(() => {
    return [
      {
        field: "created_at",
        headerName: "Datum",
        width: 140,
        valueFormatter: (v) => formatDateOnly(v),
      },

      {
        field: "akcija",
        headerName: "Akcija",
        width: 160,
        sortable: true,
        renderCell: (params) => {
          const a = String(params.value ?? "");
          const c = actionColors(a);

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Chip
                label={c.label}
                size="small"
                sx={{
                  fontWeight: 700,
                  width: 130,
                  justifyContent: "center",
                  bgcolor: `${c.bg}55`,
                  color: c.color,
                  "& .MuiChip-label": { color: c.color },
                }}
              />
            </Box>
          );
        },
      },

      {
        field: "narudzba_id",
        headerName: "Narudžba",
        width: 130,
        sortable: false,
        renderCell: (params) => {
          const orderId = params.value ? String(params.value) : "";
          const orderRef = String((params.row as any)?.narudzba_ref ?? "");

          const show = orderRef || orderId;
          if (!show) return <span style={{ opacity: 0.6 }}>-</span>;

          const short = show.length > 12 ? `${show.slice(0, 4)}…${show.slice(-4)}` : show;

          if (!orderId) {
            return (
              <Box sx={{ display: "flex", alignItems: "center", height: "100%", width: "100%" }}>
                <span title={show} style={{ whiteSpace: "nowrap" }}>
                  {short}
                </span>
              </Box>
            );
          }

          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%", width: "100%" }}>
              <span
                title={orderId}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  whiteSpace: "nowrap",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/orders/${orderId}`);
                }}
              >
                {short}
              </span>
            </Box>
          );
        },
      },

      {
        field: "kupac",
        headerName: "Kupac",
        width: 120,
        renderCell: (params) => {
          const v = String(params.value ?? "");
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%", width: "100%" }}>
              <span
                title={v}
                style={{
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {v}
              </span>
            </Box>
          );
        },
      },

      {
        field: "opis",
        headerName: "Sadržaj",
        flex: 1,
        minWidth: 160,
        renderCell: (params) => {
          const v = String(params.value ?? "");
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%", width: "100%" }}>
              <span
                title={v}
                style={{
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {v}
              </span>
            </Box>
          );
        },
      },

      {
        field: "id",
        headerName: "Log ID",
        width: 120,
        renderCell: (params) => {
          const v = String(params.value ?? "");
          const short = v.length > 12 ? `${v.slice(0, 4)}…${v.slice(-4)}` : v;

          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%", width: "100%" }}>
              <span title={v} style={{ whiteSpace: "nowrap" }}>
                {short}
              </span>
            </Box>
          );
        },
      },
    ];
  }, [router]);

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {!hydrated ? (
        <Box sx={{ p: 2 }}>Učitavam…</Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          
          sx={{
            "& .MuiDataGrid-cell": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      )}
    </Paper>
  );
}