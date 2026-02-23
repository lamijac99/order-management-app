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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import OrdersTable from "@/components/orders/OrdersTable";
import MenuButton from "@/components/template-dashboard/MenuButton";

import type { OrderRow, ProductOption, CustomerOption } from "@/app/orders/page";
import { createOrderAction } from "@/app/orders/new/actions/action";

function formatKM(value: unknown) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
}

export default function OrdersClient({
  rows,
  isAdmin,
  products,
  customers,
}: {
  rows: OrderRow[];
  isAdmin: boolean;
  products: ProductOption[];
  customers: CustomerOption[];
}) {
  const router = useRouter();

  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [proizvodId, setProizvodId] = React.useState<string>(products?.[0]?.id ?? "");
  const [kolicina, setKolicina] = React.useState<number>(1);
  const [adresa, setAdresa] = React.useState<string>("");
  const [korisnikId, setKorisnikId] = React.useState<string>(customers?.[0]?.id ?? "");

  const safe = {
    setOpen: (v: boolean) => mountedRef.current && setOpen(v),
    setBusy: (v: boolean) => mountedRef.current && setBusy(v),
    setToast: (v: { type: "success" | "error"; msg: string } | null) => mountedRef.current && setToast(v),
  };

  React.useEffect(() => {
    if (!proizvodId && products?.[0]?.id) setProizvodId(products[0].id);
  }, [products, proizvodId]);

  React.useEffect(() => {
    if (isAdmin && !korisnikId && customers?.[0]?.id) setKorisnikId(customers[0].id);
  }, [customers, isAdmin, korisnikId]);

  const resetForm = () => {
    setProizvodId(products?.[0]?.id ?? "");
    setKolicina(1);
    setAdresa("");
    setKorisnikId(customers?.[0]?.id ?? "");
  };

  const onCreate = async () => {
    safe.setBusy(true);
    try {
      const res = await createOrderAction({
        proizvod_id: proizvodId,
        kolicina: Number(kolicina),
        adresa_isporuke: adresa,
        ...(isAdmin ? { korisnik_id: korisnikId } : {}),
      });

      if (!res.ok) {
        safe.setToast({ type: "error", msg: res.error || "Greška." });
        return;
      }

      safe.setToast({ type: "success", msg: "Narudžba je kreirana." });
      safe.setOpen(false);
      resetForm();
      router.refresh();
    } finally {
      safe.setBusy(false);
    }
  };

  const selectedProduct = React.useMemo(
    () => products.find((p) => p.id === proizvodId) ?? null,
    [products, proizvodId]
  );

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Narudžbe
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Pregled i upravljanje narudžbama. Pretraga i filtriranje su dostupni kroz kolone.
          </Typography>
        </Box>

        <Tooltip title="Dodaj narudžbu">
          <span>
            <MenuButton aria-label="Dodaj narudžbu" onClick={() => safe.setOpen(true)} disabled={busy}>
              <AddRoundedIcon fontSize="small" />
            </MenuButton>
          </span>
        </Tooltip>
      </Stack>

      <OrdersTable rows={rows} isAdmin={isAdmin} />

      <Dialog open={open} onClose={() => (busy ? null : safe.setOpen(false))} fullWidth maxWidth="sm">
        <DialogTitle>Dodaj narudžbu</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              select
              label="Proizvod"
              value={proizvodId}
              onChange={(e) => setProizvodId(String(e.target.value))}
              fullWidth
              disabled={busy}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.naziv} — {formatKM(p.cijena)}
                </MenuItem>
              ))}
            </TextField>

            {isAdmin ? (
              <TextField
                select
                label="Kupac"
                value={korisnikId}
                onChange={(e) => setKorisnikId(String(e.target.value))}
                fullWidth
                disabled={busy}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.ime}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            <TextField
              label="Količina"
              type="number"
              value={kolicina}
              onChange={(e) => setKolicina(Number(e.target.value))}
              fullWidth
              disabled={busy}
              inputProps={{ min: 1, step: 1 }}
              helperText={selectedProduct ? `Cijena po komadu: ${formatKM(selectedProduct.cijena)}` : "Odaberi proizvod."}
            />

            <TextField
              label="Adresa isporuke"
              value={adresa}
              onChange={(e) => setAdresa(e.target.value)}
              fullWidth
              disabled={busy}
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