"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import ProductsTable from "@/components/products/ProductsTable";
import MenuButton from "@/components/template-dashboard/MenuButton";
import type { ProductRow } from "@/app/products/page";
import { createProductAction } from "@/app/products/actions";

export default function ProductsClient({ rows }: { rows: ProductRow[] }) {
  const router = useRouter();

  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [open, setOpen] = React.useState(false);
  const [naziv, setNaziv] = React.useState("");
  const [cijena, setCijena] = React.useState<string>("0");
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const safe = {
    setOpen: (v: boolean) => mountedRef.current && setOpen(v),
    setNaziv: (v: string) => mountedRef.current && setNaziv(v),
    setCijena: (v: string) => mountedRef.current && setCijena(v),
    setBusy: (v: boolean) => mountedRef.current && setBusy(v),
    setToast: (v: { type: "success" | "error"; msg: string } | null) => mountedRef.current && setToast(v),
  };

  const resetForm = () => {
    safe.setNaziv("");
    safe.setCijena("0");
  };

  const onCreate = async () => {
    safe.setBusy(true);
    try {
      const res = await createProductAction({ naziv, cijena: Number(cijena) });

      if (!res.ok) {
        safe.setToast({ type: "error", msg: res.error || "Greška." });
        return;
      }

      safe.setToast({ type: "success", msg: "Proizvod je kreiran." });
      safe.setOpen(false);
      resetForm();

      router.refresh();
    } finally {
      safe.setBusy(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Proizvodi
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Upravljanje proizvodima - dodavanje, editovanje i brisanje.
          </Typography>
        </Box>

        <Tooltip title="Dodaj proizvod">
          <span>
            <MenuButton aria-label="Dodaj proizvod" onClick={() => safe.setOpen(true)} disabled={busy}>
              <AddRoundedIcon fontSize="small" />
            </MenuButton>
          </span>
        </Tooltip>
      </Stack>

      <ProductsTable rows={rows} />

      <Dialog open={open} onClose={() => (busy ? null : safe.setOpen(false))} fullWidth maxWidth="sm">
        <DialogTitle>Dodaj proizvod</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Naziv"
              value={naziv}
              onChange={(e) => safe.setNaziv(e.target.value)}
              fullWidth
              autoFocus
              disabled={busy}
            />
            <TextField
              label="Cijena"
              type="number"
              value={cijena}
              onChange={(e) => safe.setCijena(e.target.value)}
              fullWidth
              disabled={busy}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              safe.setOpen(false);
              resetForm();
            }}
            disabled={busy}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={onCreate} disabled={busy}>
            Dodaj
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