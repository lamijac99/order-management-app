"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import NextLink from "next/link";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type { OrderRow, OrderStatus } from "@/app/orders/page";
import { updateOrderAction, deleteOrderAction } from "@/app/orders/[id]/action";

const STATUS_OPTIONS: OrderStatus[] = ["KREIRANA", "U_OBRADI", "POSLATA", "ISPORUCENA", "OTKAZANA"];

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
        justifyContent: "center",
        gap: 1,
        bgcolor: bg,
        color: fg,
        fontWeight: 800,
        borderRadius: 1.5,
        userSelect: "none",
        opacity: 0.8,
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: fg }} />
      <span style={{ fontSize: 13 }}>{status}</span>
    </Box>
  );
}

function formatKM(value: unknown) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
}

export default function OrdersTable({ rows, isAdmin }: { rows: OrderRow[]; isAdmin: boolean }) {
  const router = useRouter();

  const mountedRef = React.useRef(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    mountedRef.current = true;
    setHydrated(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [localRows, setLocalRows] = React.useState<OrderRow[]>(rows);
  React.useEffect(() => setLocalRows(rows), [rows]);

  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const safe = {
    setBusy: (v: boolean) => mountedRef.current && setBusy(v),
    setToast: (v: { type: "success" | "error"; msg: string } | null) => mountedRef.current && setToast(v),
  };

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState<{ id: string; from: OrderStatus; to: OrderStatus } | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editOrder, setEditOrder] = React.useState<{ id: string; kolicina: number; adresa: string } | null>(null);
  const [editKolicina, setEditKolicina] = React.useState(1);
  const [editAdresa, setEditAdresa] = React.useState("");
  const [editLoading, setEditLoading] = React.useState(false);

  const columns = React.useMemo<GridColDef<OrderRow>[]>(() => {
    const dateCol: GridColDef<OrderRow> = {
      field: "datum_kreiranja",
      headerName: "Datum",
      width: 115,
      sortable: true,
      valueFormatter: (v) => {
        const s = String(v ?? "");
        if (!s) return "-";
        return s.split("T")[0];
      },
    };

    const ukupnoCol: GridColDef<OrderRow> = {
      field: "ukupno",
      headerName: "Ukupno",
      width: 140,
      sortable: true,
      valueGetter: (_, row) => row.kolicina * Number(row.cijena_po_komadu),
      renderCell: (params) => <Box sx={{ width: "100%", textAlign: "right" }}>{formatKM(params.value)}</Box>,
      sortComparator: (v1, v2) => Number(v1) - Number(v2),
      align: "right",
      headerAlign: "right",
    };

    const statusCol: GridColDef<OrderRow> = {
      field: "status",
      headerName: "Status",
      width: 180,
      sortable: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const current = params.value as OrderStatus;
        const id = String((params.row as any)?.id ?? "");
        if (!id || id === "undefined") return <span style={{ color: "#b71c1c", fontSize: 12 }}>ID missing</span>;

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
              opacity: 0.8,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
              "& .MuiSelect-icon": { color: fg },
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              },
            }}
            renderValue={(val) => {
              const v = val as OrderStatus;
              const c = statusColors(v);
              return (
                <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
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

    const actionsCol: GridColDef<OrderRow> = {
      field: "_actions",
      headerName: "Akcije",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
      width: 140,
      renderCell: (params) => {
        const id = String((params.row as any)?.id ?? "");
        if (!id || id === "undefined") return <span style={{ opacity: 0.6 }}>-</span>;

        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              width: "100%",
              height: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Tooltip title="Uredi">
              <span>
                <IconButton
                  size="small"
                  disabled={busy}
                  onClick={() => {
                    const row = params.row as OrderRow;
                    setEditOrder({ id, kolicina: row.kolicina, adresa: row.adresa_isporuke ?? "" });
                    setEditKolicina(row.kolicina);
                    setEditAdresa(row.adresa_isporuke ?? "");
                    setEditOpen(true);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Obriši">
              <span>
                <IconButton
                  size="small"
                  disabled={busy}
                  onClick={() => {
                    setDeleteId(id);
                    setDeleteOpen(true);
                  }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    };

    return [
      {
        field: "id",
        headerName: "ID",
        width: 120,
        renderCell: (params) => {
          const id = String((params.row as any)?.id ?? "");
          const short = id.length > 12 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;

          if (!id || id === "undefined") return <span style={{ color: "#b71c1c" }}>—</span>;

          return (
            <NextLink href={`/orders/${encodeURIComponent(id)}`} style={{ textDecoration: "none" }}>
              <Box
                component="span"
                title={id}
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                {short}
              </Box>
            </NextLink>
          );
        },
      },
      dateCol,
      { field: "proizvod", headerName: "Proizvod", width: 140 },
      { field: "kupac", headerName: "Kupac", width: 130 },
      { field: "kolicina", headerName: "Količina", type: "number", width: 95, align: "left", headerAlign: "left" },
      ukupnoCol,
      { field: "adresa_isporuke", headerName: "Adresa", flex: 1, minWidth: 160 },
      statusCol,
      actionsCol,
    ];
  }, [isAdmin, busy]);

  const doUpdate = async () => {
    if (!pending) return;

    if (!isAdmin) {
      safe.setToast({ type: "error", msg: "Nemaš pravo mijenjati status." });
      setPending(null);
      setConfirmOpen(false);
      return;
    }

    const { id, from, to } = pending;

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

      safe.setToast({ type: "success", msg: `Status promijenjen: ${from} → ${to}` });
      router.refresh();
    } catch (e: any) {
      setLocalRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: from } : r)));
      safe.setToast({ type: "error", msg: e?.message || "Greška pri ažuriranju statusa" });
    } finally {
      setPending(null);
    }
  };

  const doDelete = async () => {
    const id = String(deleteId ?? "");
    setDeleteOpen(false);
    safe.setBusy(true);

    try {
      const res = await deleteOrderAction(id);
      if (!res.ok) throw new Error(res.error || "Delete failed");

      setLocalRows((prev) => prev.filter((r) => r.id !== id));
      safe.setToast({ type: "success", msg: "Narudžba obrisana." });
      router.refresh();
    } catch (e: any) {
      safe.setToast({ type: "error", msg: e?.message || "Greška pri brisanju" });
    } finally {
      safe.setBusy(false);
      setDeleteId(null);
    }
  };

  const doEdit = async () => {
    if (!editOrder) return;

    if (!editAdresa.trim()) {
      safe.setToast({ type: "error", msg: "Adresa isporuke je obavezna." });
      return;
    }
    if (editAdresa.trim().length < 5) {
      safe.setToast({ type: "error", msg: "Adresa isporuke je prekratka." });
      return;
    }

    setEditLoading(true);

    const res = await updateOrderAction({
      orderId: editOrder.id,
      kolicina: editKolicina,
      adresa_isporuke: editAdresa.trim(),
    });

    setEditLoading(false);

    if (!res.ok) {
      safe.setToast({ type: "error", msg: res.error || "Greška pri spremanju." });
      return;
    }

    setLocalRows((prev) =>
      prev.map((r) =>
        r.id === editOrder.id ? { ...r, kolicina: editKolicina, adresa_isporuke: editAdresa.trim() } : r
      )
    );

    safe.setToast({ type: "success", msg: "Narudžba je ažurirana." });
    setEditOpen(false);
    setEditOrder(null);
    router.refresh();
  };

  return (
    <>
      <Paper elevation={0} variant="outlined" sx={{ width: "100%", borderRadius: "8px", overflow: "hidden" }}>
        {!hydrated ? (
          <Box sx={{ p: 2 }}>Učitavam…</Box>
        ) : (
          <DataGrid
            rows={localRows}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            checkboxSelection
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { borderBottom: "1px solid", borderColor: "divider" },

              "& .MuiDataGrid-footerContainer": { borderTop: "0 !important" },
              "& .MuiDataGrid-withBorderColor": { borderColor: "transparent" },
            }}
          />
        )}
      </Paper>

      <Dialog
        open={confirmOpen && isAdmin}
        onClose={() => {
          if (busy) return;
          setConfirmOpen(false);
          setPending(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Potvrda promjene</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          Da li si sigurna da želiš promijeniti status sa <b>{pending?.from}</b> na <b>{pending?.to}</b>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setPending(null);
            }}
            disabled={busy}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={doUpdate} disabled={busy}>
            Promijeni
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => {
          if (busy) return;
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>Da li si sigurna da želiš obrisati ovu narudžbu?</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteOpen(false);
              setDeleteId(null);
            }}
            disabled={busy}
          >
            Odustani
          </Button>
          <Button color="error" variant="contained" onClick={doDelete} disabled={busy}>
            Obriši
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => {
          if (editLoading) return;
          setEditOpen(false);
          setEditOrder(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Uredi narudžbu</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Količina"
              type="number"
              value={editKolicina}
              onChange={(e) => setEditKolicina(Number(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
              disabled={editLoading}
            />

            <TextField
              label="Adresa isporuke"
              value={editAdresa}
              onChange={(e) => setEditAdresa(e.target.value)}
              fullWidth
              multiline
              minRows={1}
              maxRows={3}
              spellCheck={false}
              disabled={editLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditOpen(false);
              setEditOrder(null);
            }}
            disabled={editLoading}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={doEdit} disabled={editLoading}>
            Spasi
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => safe.setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert onClose={() => safe.setToast(null)} severity={toast.type} variant="filled">
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}