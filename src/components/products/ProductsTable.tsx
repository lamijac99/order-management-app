"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";

import type { ProductRow } from "@/app/products/page";
import { updateProductAction, deleteProductAction } from "@/app/products/actions";

function formatKM(value: unknown) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
}

export default function ProductsTable({ rows }: { rows: ProductRow[] }) {
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

  const [editOpen, setEditOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string>("");
  const [editNaziv, setEditNaziv] = React.useState("");
  const [editCijena, setEditCijena] = React.useState<string>("0");

  const [delOpen, setDelOpen] = React.useState(false);
  const [delId, setDelId] = React.useState<string>("");

  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const safe = {
    setBusy: (v: boolean) => mountedRef.current && setBusy(v),
    setToast: (v: { type: "success" | "error"; msg: string } | null) => mountedRef.current && setToast(v),
    setEditOpen: (v: boolean) => mountedRef.current && setEditOpen(v),
    setDelOpen: (v: boolean) => mountedRef.current && setDelOpen(v),
  };

  const openEdit = (row: ProductRow) => {
    setEditId(row.id);
    setEditNaziv(row.naziv ?? "");
    setEditCijena(String(row.cijena ?? 0));
    safe.setEditOpen(true);
  };

  const openDelete = (id: string) => {
    setDelId(id);
    safe.setDelOpen(true);
  };

  const onSaveEdit = async () => {
    safe.setBusy(true);
    try {
      const res = await updateProductAction({
        productId: editId,
        naziv: editNaziv,
        cijena: Number(editCijena),
      });

      if (!res.ok) {
        safe.setToast({ type: "error", msg: res.error || "Greška." });
        return;
      }

      safe.setToast({ type: "success", msg: "Proizvod je ažuriran." });
      safe.setEditOpen(false);

      router.refresh();
    } finally {
      safe.setBusy(false);
    }
  };

  const onConfirmDelete = async () => {
    safe.setBusy(true);
    try {
      const res = await deleteProductAction(delId);

      if (!res.ok) {
        safe.setToast({ type: "error", msg: res.error || "Greška." });
        return;
      }

      safe.setToast({ type: "success", msg: "Proizvod je obrisan." });
      safe.setDelOpen(false);

      router.refresh();
    } finally {
      safe.setBusy(false);
    }
  };

  const columns = React.useMemo<GridColDef<ProductRow>[]>(
    () => [
      { field: "naziv", headerName: "Naziv", flex: 1, minWidth: 200 },
      {
        field: "cijena",
        headerName: "Cijena",
        type: "number",
        flex: 0.6,
        minWidth: 140,
        align: "right",
        headerAlign: "right",
        renderCell: (params: GridRenderCellParams<ProductRow, number>) => (
          <Box sx={{ width: "100%", textAlign: "right" }}>{formatKM(params.value)}</Box>
        ),
      },
      {
        field: "actions",
        headerName: "Akcije",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        width: 140,
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              width: "100%",
              height: "100%",
            }}
          >
            <Tooltip title="Uredi">
              <span>
                <IconButton size="small" disabled={busy} onClick={() => openEdit(params.row)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Obriši">
              <span>
                <IconButton size="small" disabled={busy} onClick={() => openDelete(params.row.id)}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [busy]
  );

  return (
    <>
      <Paper elevation={0} variant="outlined" sx={{ width: "100%", borderRadius: "8px", overflow: "hidden" }}>
        {!hydrated ? (
          <Box sx={{ p: 2 }}>Učitavam…</Box>
        ) : (
          <DataGrid rows={rows} columns={columns} autoHeight checkboxSelection />
        )}
      </Paper>

      <Dialog open={editOpen} onClose={() => (busy ? null : safe.setEditOpen(false))} fullWidth maxWidth="sm">
        <DialogTitle>Uredi proizvod</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Naziv"
              value={editNaziv}
              onChange={(e) => setEditNaziv(e.target.value)}
              fullWidth
              autoFocus
              disabled={busy}
            />
            <TextField
              label="Cijena"
              type="number"
              value={editCijena}
              onChange={(e) => setEditCijena(e.target.value)}
              fullWidth
              disabled={busy}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => safe.setEditOpen(false)} disabled={busy}>
            Odustani
          </Button>
          <Button variant="contained" onClick={onSaveEdit} disabled={busy}>
            Spasi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={delOpen} onClose={() => (busy ? null : safe.setDelOpen(false))} fullWidth maxWidth="xs">
        <DialogTitle>Obrisati proizvod?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          Ova akcija je trajna. Da li ste sigurni?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => safe.setDelOpen(false)} disabled={busy}>
            Ne
          </Button>
          <Button color="error" variant="contained" onClick={onConfirmDelete} disabled={busy}>
            Da, obriši
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