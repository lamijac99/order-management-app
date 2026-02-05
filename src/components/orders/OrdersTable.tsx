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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { OrderRow, OrderStatus } from "@/app/orders/page";
import NextLink from "next/link";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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

export default function OrdersTable({ rows, isAdmin }: { rows: OrderRow[]; isAdmin: boolean }) {
  const [localRows, setLocalRows] = useState<OrderRow[]>(rows);
  useEffect(() => setLocalRows(rows), [rows]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{ id: string; from: OrderStatus; to: OrderStatus } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<{ id: string; kolicina: number; adresa: string } | null>(null);
  const [editKolicina, setEditKolicina] = useState(0);
  const [editAdresa, setEditAdresa] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const columns: GridColDef<OrderRow>[] = useMemo(() => {
    const statusCol: GridColDef<OrderRow> = {
      field: "status",
      headerName: "Status",
      width: 170,
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
                gap: 8,
              },
            }}
            renderValue={(val) => {
              const v = val as OrderStatus;
              const c = statusColors(v);
              return (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
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

    const dateCol: GridColDef<OrderRow> = {
      field: "datum_kreiranja",
      headerName: "Datum",
      width: 100,
      sortable: true,
      valueFormatter: (v) => {
        const s = String(v ?? "");
        if (!s) return "-";
        return s.split("T")[0];
      },
    };

    const actionsCol: GridColDef<OrderRow> = {
      field: "_actions",
      headerName: "Akcije",
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const id = String((params.row as any)?.id ?? "");
        if (!id || id === "undefined") return <span style={{ opacity: 0.6 }}>-</span>;

        return (
          <Box
            sx={{ display: "flex", gap: 0.5, justifyContent: "center", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Tooltip title="Uredi">
              <IconButton
                size="small"
                aria-label="Uredi narudžbu"
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
            </Tooltip>

            <Tooltip title="Obriši">
              <IconButton
                size="small"
                aria-label="Obriši narudžbu"
                onClick={() => {
                  setDeleteId(id);
                  setDeleteOpen(true);
                }}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    };

    return [
      {
        field: "id",
        headerName: "ID narudžbe",
        width: 120,
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
      dateCol,
      { field: "proizvod", headerName: "Proizvod", width: 120 },
      { field: "kupac", headerName: "Kupac", width: 105 },
      { field: "kolicina", headerName: "Količina",headerAlign: "left",align: "left", type: "number", width: 90 },
      {
        field: "ukupno",
        headerName: "Ukupno (KM)",
        width: 120,
        sortable: true,
        valueGetter: (_, row) => row.kolicina * Number(row.cijena_po_komadu),
        valueFormatter: (v) => Number(v ?? 0).toFixed(2),
        sortComparator: (v1, v2) => Number(v1) - Number(v2),
      },
      { field: "adresa_isporuke", headerName: "Adresa", flex: 1, minWidth: 140 },
      statusCol,
      actionsCol,
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

  const doDelete = async () => {
    const id = String(deleteId ?? "");
    if (!id || id === "undefined") {
      setToast({ type: "error", msg: "Neispravan ID narudžbe." });
      setDeleteOpen(false);
      setDeleteId(null);
      return;
    }

    setDeleteOpen(false);

    try {
      const res = await deleteOrderAction(id);
      if (!res.ok) throw new Error(res.error || "Delete failed");

      setLocalRows((prev) => prev.filter((r) => r.id !== id));
      setToast({ type: "success", msg: "Narudžba obrisana." });
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri brisanju" });
    } finally {
      setDeleteId(null);
    }
  };

  const doEdit = async () => {
    if (!editOrder) return;

    if (!editAdresa.trim()) {
      setToast({ type: "error", msg: "Adresa isporuke je obavezna." });
      return;
    }
    if (editAdresa.trim().length < 5) {
      setToast({ type: "error", msg: "Adresa isporuke je prekratka." });
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
      setToast({ type: "error", msg: res.error || "Greška pri spremanju." });
      return;
    }

    setLocalRows((prev) =>
      prev.map((r) =>
        r.id === editOrder.id ? { ...r, kolicina: editKolicina, adresa_isporuke: editAdresa.trim() } : r
      )
    );
    setToast({ type: "success", msg: "Narudžba je ažurirana." });
    setEditOpen(false);
    setEditOrder(null);
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

      <Dialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
      >
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent>Da li si sigurna da želiš obrisati ovu narudžbu?</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteOpen(false);
              setDeleteId(null);
            }}
          >
            Odustani
          </Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Obriši
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi narudžbu</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Količina"
              type="number"
              value={editKolicina}
              onChange={(e) => setEditKolicina(Number(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditOpen(false);
              setEditOrder(null);
            }}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={doEdit} disabled={editLoading}>
            Spasi
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