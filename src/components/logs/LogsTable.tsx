"use client";

import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LogRow } from "@/app/logs/page";

function actionChip(akcija: string) {
  const a = String(akcija ?? "").toUpperCase();
  if (a.includes("DELETE") || a.includes("OBRIS")) return { label: akcija, color: "error" as const };
  if (a.includes("STATUS") || a.includes("UPDATE") || a.includes("EDIT") || a.includes("IZMIJ"))
    return { label: akcija, color: "warning" as const };
  if (a.includes("CREATE") || a.includes("KREIR")) return { label: akcija, color: "success" as const };
  return { label: akcija, color: "default" as const };
}

export default function LogsTable({ rows }: { rows: LogRow[] }) {
  const router = useRouter();

  const columns: GridColDef<LogRow>[] = useMemo(() => {
    return [
      {
        field: "created_at",
        headerName: "Vrijeme",
        width: 170,
        valueFormatter: (v) => String(v).replace("T", " ").replace("Z", ""),
      },
      {
        field: "akcija",
        headerName: "Akcija",
        width: 150,
        sortable: true,
        renderCell: (params) => {
          const a = String(params.value ?? "");
          const c = actionChip(a);
          return <Chip label={c.label} color={c.color} size="small" sx={{ fontWeight: 700 }} />;
        },
      },
      {
        field: "narudzba_id",
        headerName: "Narudžba",
        width: 150,
        sortable: false,
        renderCell: (params) => {
          const orderId = params.value ? String(params.value) : "";

          const orderRef = String((params.row as any)?.narudzba_ref ?? "");

          const show = orderRef || orderId;
          if (!show) return <span style={{ opacity: 0.6 }}>-</span>;

          const short = show.length > 12 ? `${show.slice(0, 4)}…${show.slice(-4)}` : show;

          if (!orderId) {
            return (
              <Typography
                component="span"
                title={show}
                sx={{ fontSize: 13, whiteSpace: "nowrap", opacity: 0.9 }}
              >
                {short}
              </Typography>
            );
          }

          return (
            <Typography
              component="span"
              title={orderId}
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/orders/${orderId}`);
              }}
            >
              {short}
            </Typography>
          );
        },
      },
      {
        field: "kupac",
        headerName: "Kupac",
        width: 170,
        renderCell: (params) => <span title={String(params.value ?? "")}>{String(params.value ?? "")}</span>,
      },
      {
        field: "opis",
        headerName: "Opis",
        flex: 1,
        minWidth: 180,
      },
      {
        field: "id",
        headerName: "Log ID",
        width: 140,
        renderCell: (params) => {
          const v = String(params.value ?? "");
          const short = v.length > 12 ? `${v.slice(0, 4)}…${v.slice(-4)}` : v;
          return <span title={v}>{short}</span>;
        },
      },
    ];
  }, [router]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%", overflowX: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          hideFooter
          disableRowSelectionOnClick
          disableColumnMenu
          sx={{
            border: 0,
            width: "100%",
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
      </Box>
    </Paper>
  );
}
