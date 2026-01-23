"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { updateOrderAction } from "@/app/orders/[id]/action";

export default function EditOrderButton({
  orderId,
  initialKolicina,
  initialAdresa,
}: {
  orderId: string;
  initialKolicina: number;
  initialAdresa: string;
}) {
  const [open, setOpen] = useState(false);
  const [kolicina, setKolicina] = useState(initialKolicina);
  const [adresa, setAdresa] = useState(initialAdresa);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!adresa.trim()) {
      toast.error("Adresa isporuke je obavezna.");
      return;
    }
    if (adresa.trim().length < 5) {
      toast.error("Adresa isporuke je prekratka.");
      return;
    }

    setLoading(true);

    const res = await updateOrderAction({
      orderId,
      kolicina,
      adresa_isporuke: adresa.trim(),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error(res.error || "Greška pri spremanju.");
      return;
    }

    toast.success("Narudžba je ažurirana.");
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <Tooltip title="Uredi narudžbu">
        <IconButton color="primary" size="small" onClick={() => setOpen(true)}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi narudžbu</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Količina"
              type="number"
              value={kolicina}
              onChange={(e) => setKolicina(Number(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
            />

            <TextField
              label="Adresa isporuke"
              value={adresa}
              onChange={(e) => setAdresa(e.target.value)}
              fullWidth
              multiline
              minRows={1}
              maxRows={3}
              spellCheck={false}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Odustani</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
          >
            Spasi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
