"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { createProductAction, updateProductAction, deleteProductAction } from "@/app/products/actions";
import type { ProductRow } from "@/app/products/page";

export default function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const router = useRouter();
  const [localRows, setLocalRows] = useState<ProductRow[]>(rows);
  useEffect(() => setLocalRows(rows), [rows]);

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createNaziv, setCreateNaziv] = useState("");
  const [createCijena, setCreateCijena] = useState(0);
  const [createLoading, setCreateLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [editNaziv, setEditNaziv] = useState("");
  const [editCijena, setEditCijena] = useState(0);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<ProductRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns: GridColDef<ProductRow>[] = useMemo(() => {
    return [
      { field: "naziv", headerName: "Naziv", width: 300 },
      {
        field: "cijena",
        headerName: "Cijena (KM)",
        width: 140,
        type: "number",
        valueFormatter: (v) => Number(v ?? 0).toFixed(2),
      },
      {
        field: "_actions",
        headerName: "Akcije",
        width: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const row = params.row as ProductRow;

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
                  aria-label="Uredi proizvod"
                  onClick={() => {
                    setEditProduct(row);
                    setEditNaziv(row.naziv);
                    setEditCijena(row.cijena);
                    setEditOpen(true);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Obriši">
                <IconButton
                  size="small"
                  aria-label="Obriši proizvod"
                  onClick={() => {
                    setDeleteProduct(row);
                    setDeleteOpen(true);
                  }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, []);

  const doCreate = async () => {
    if (!createNaziv.trim() || createNaziv.length < 2) {
      setToast({ type: "error", msg: "Naziv mora imati najmanje 2 karaktera." });
      return;
    }
    if (!Number.isFinite(createCijena) || createCijena < 0) {
      setToast({ type: "error", msg: "Cijena mora biti pozitivan broj." });
      return;
    }

    setCreateLoading(true);

    try {
      const res = await createProductAction({
        naziv: createNaziv.trim(),
        cijena: createCijena,
      });

      if (!res.ok) {
        setToast({ type: "error", msg: res.error || "Greška pri kreiranju proizvoda." });
        return;
      }

      setToast({ type: "success", msg: "Proizvod je uspješno kreiran." });
      setCreateOpen(false);
      setCreateNaziv("");
      setCreateCijena(0);
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri kreiranju proizvoda." });
    } finally {
      setCreateLoading(false);
    }
  };

  const doEdit = async () => {
    if (!editProduct) return;

    if (!editNaziv.trim() || editNaziv.length < 2) {
      setToast({ type: "error", msg: "Naziv mora imati najmanje 2 karaktera." });
      return;
    }
    if (!Number.isFinite(editCijena) || editCijena < 0) {
      setToast({ type: "error", msg: "Cijena mora biti pozitivan broj." });
      return;
    }

    setEditLoading(true);

    try {
      const res = await updateProductAction({
        productId: editProduct.id,
        naziv: editNaziv.trim(),
        cijena: editCijena,
      });

      if (!res.ok) {
        setToast({ type: "error", msg: res.error || "Greška pri ažuriranju proizvoda." });
        return;
      }

      setToast({ type: "success", msg: "Proizvod je ažuriran." });
      setEditOpen(false);
      setEditProduct(null);
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri ažuriranju proizvoda." });
    } finally {
      setEditLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteProduct) return;

    setDeleteLoading(true);

    try {
      const res = await deleteProductAction(deleteProduct.id);

      if (!res.ok) {
        setToast({ type: "error", msg: res.error || "Greška pri brisanju proizvoda." });
        setDeleteLoading(false);
        return;
      }

      setLocalRows((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      setToast({ type: "success", msg: "Proizvod je obrisan." });
      setDeleteOpen(false);
      setDeleteProduct(null);
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri brisanju proizvoda." });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, maxWidth: 600, width: "100%" }}>
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
      </Box>

      <Tooltip title="Kreiraj proizvod" placement="left">
        <Fab
          color="primary"
          aria-label="kreiraj proizvod"
          onClick={() => setCreateOpen(true)}
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1300,
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Create Product Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kreiraj proizvod</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Naziv"
              value={createNaziv}
              onChange={(e) => setCreateNaziv(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Cijena (KM)"
              type="number"
              value={createCijena}
              onChange={(e) => setCreateCijena(Number(e.target.value))}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={createLoading}>
            Odustani
          </Button>
          <Button variant="contained" onClick={doCreate} disabled={createLoading}>
            Kreiraj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi proizvod</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Naziv"
              value={editNaziv}
              onChange={(e) => setEditNaziv(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Cijena (KM)"
              type="number"
              value={editCijena}
              onChange={(e) => setEditCijena(Number(e.target.value))}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editLoading}>
            Odustani
          </Button>
          <Button variant="contained" onClick={doEdit} disabled={editLoading}>
            Spasi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent>
          <Box>
            Da li ste sigurni da želite obrisati proizvod <b>{deleteProduct?.naziv}</b>?
          </Box>
          <Box sx={{ mt: 1, color: "text.secondary", fontSize: "0.875rem" }}>
            Proizvod sa narudžbama ne može biti obrisan.
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
            Odustani
          </Button>
          <Button color="error" variant="contained" onClick={doDelete} disabled={deleteLoading}>
            Obriši
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

