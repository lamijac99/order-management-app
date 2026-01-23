"use client";

import { useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { OrderRow, OrderStatus } from "@/app/orders/page";
import NextLink from "next/link";

const STATUS_OPTIONS: OrderStatus[] = [
  "KREIRANA",
  "U_OBRADI",
  "POSLATA",
  "ISPORUCENA",
  "OTKAZANA",
];

function statusColors(status: OrderStatus) {
  switch (status) {
    case "KREIRANA":
      return { bg: "#e3f2fd", fg: "#0d47a1" };
    case "U_OBRADI":
      return { bg: "#fff8e1", fg: "#e65100" };
    case "POSLATA":
      return { bg: "#e8f5e9", fg: "#1b5e20" };
    case "ISPORUCENA":
      return { bg: "#ede7f6", fg: "#311b92" };
    case "OTKAZANA":
      return { bg: "#ffebee", fg: "#b71c1c" };
  }
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { bg, fg } = statusColors(status);

  return (
    <Box
      sx={{
        width: "100%",
        height: 34,
        px: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: bg,
        color: fg,
        fontWeight: 800,
        borderRadius: 1.5,
        userSelect: "none",
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: fg }} />
      <span style={{ fontSize: 13 }}>{status}</span>
    </Box>
  );
}

export default function OrdersTable({
  rows,
  isAdmin,
}: {
  rows: OrderRow[];
  isAdmin: boolean;
}) {
  const [localRows, setLocalRows] = useState<OrderRow[]>(rows);
  useEffect(() => setLocalRows(rows), [rows]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{ id: string; from: OrderStatus; to: OrderStatus } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const columns: GridColDef<OrderRow>[] = useMemo(() => {
    const statusCol: GridColDef<OrderRow> = {
      field: "status",
      headerName: "Status",
      width: 180,
      sortable: true,
      renderCell: (params) => {
        const current = params.value as OrderStatus;

        const id = String((params.row as any)?.id ?? "");
        if (!id || id === "undefined") {
          return <span style={{ color: "#b71c1c", fontSize: 12 }}>ID missing</span>;
        }

        if (!isAdmin) {
          return (
            <Box
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{ width: "100%" }}
            >
              <StatusBadge status={current} />
            </Box>
          );
        }

        const { bg, fg } = statusColors(current);

        return (
          <Select
            size="small"
            value={current}
            onChange={(e) => {
              const next = e.target.value as OrderStatus;
              if (next === current) return;

              setPending({ id, from: current, to: next });
              setConfirmOpen(true);
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            sx={{
              width: "100%",
              height: 34,
              bgcolor: bg,
              color: fg,
              fontWeight: 800,
              borderRadius: 1.5,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
              "& .MuiSelect-icon": { color: fg },
            }}
            renderValue={(val) => {
              const v = val as OrderStatus;
              const c = statusColors(v);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.fg }} />
                  <span style={{ fontSize: 13 }}>{v}</span>
                </Box>
              );
            }}
          >
            {STATUS_OPTIONS.map((s) => {
              const c = statusColors(s);
              return (
                <MenuItem key={s} value={s}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.fg }} />
                    <span style={{ fontWeight: 800, color: c.fg }}>{s}</span>
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        );
      },
    };

    return [
      {
        field: "id",
        headerName: "ID narudžbe",
        width: 160,
        renderCell: (params) => {
          const id = String((params.row as any)?.id ?? "");
          const short = id.length > 12 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;

          if (!id || id === "undefined") return <span style={{ color: "#b71c1c" }}>—</span>;

          return (
            <Link component={NextLink} href={`/orders/${id}`} underline="hover" title={id}>
              {short}
            </Link>
          );
        },
      },
      { field: "proizvod", headerName: "Proizvod", flex: 1, minWidth: 160 },
      { field: "kupac", headerName: "Kupac", width: 160 },
      { field: "kolicina", headerName: "Količina", type: "number", width: 90 },
      {
        field: "cijena_po_komadu",
        headerName: "Cijena/kom",
        type: "number",
        width: 110,
        valueFormatter: (v) => Number(v ?? 0).toFixed(2),
      },
      {
        field: "ukupno",
        headerName: "Ukupno",
        width: 100,
        valueGetter: (_, row) => row.kolicina * Number(row.cijena_po_komadu),
        valueFormatter: (v) => Number(v ?? 0).toFixed(2),
        sortable: false,
      },
      { field: "adresa_isporuke", headerName: "Adresa", flex: 1, minWidth: 140 },
      statusCol,
    ];
  }, [isAdmin]);

  const doUpdate = async () => {
    if (!pending) return;

    if (!isAdmin) {
      setToast({ type: "error", msg: "Nemaš pravo mijenjati status." });
      setPending(null);
      setConfirmOpen(false);
      return;
    }

    const { id, from, to } = pending;

    if (!id || id === "undefined") {
      setToast({ type: "error", msg: "ID narudžbe nedostaje (undefined)." });
      setPending(null);
      setConfirmOpen(false);
      return;
    }

    setLocalRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: to } : r)));
    setConfirmOpen(false);

    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

                    setToast({ type: "success", msg: `Status promijenjen: ${from} → ${to}` });
    } catch (e: any) {
      setLocalRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: from } : r)));
      setToast({ type: "error", msg: e?.message || "Greška pri ažuriranju statusa" });
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <DataGrid
          rows={localRows}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          hideFooter
          disableRowSelectionOnClick
          disableColumnMenu
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { borderBottom: "1px solid #eee" },
          }}
        />
      </Paper>

      <Dialog
        open={confirmOpen && isAdmin}
        onClose={() => {
          setConfirmOpen(false);
          setPending(null);
        }}
      >
        <DialogTitle>Potvrda promjene</DialogTitle>
        <DialogContent>
          Da li si sigurna da želiš promijeniti status sa <b>{pending?.from}</b> na <b>{pending?.to}</b>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setPending(null);
            }}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={doUpdate}>
            Promijeni
          </Button>
        </DialogActions>
      </Dialog>

      {toast && (
        <Snackbar
          open
          autoHideDuration={2500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: "100%" }}>
            {toast.msg}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
