"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteOrderAction } from "@/app/orders/[id]/action";

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!orderId) return;

    setBusy(true);
    const res = await deleteOrderAction(orderId);
    setBusy(false);

    if (!res.ok) {
      toast.error(res.error || "Brisanje nije uspjelo.");
      setOpen(false);
      return;
    }

    toast.success("Narudžba obrisana.");
    setTimeout(() => {
      window.location.href = "/orders";
    }, 600);
  };

  return (
    <>
      <Tooltip title="Obriši narudžbu">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            color: "#d32f2f",
            "&:hover": { backgroundColor: "rgba(211,47,47,0.08)" },
          }}
          aria-label="obrisi narudzbu"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => !busy && setOpen(false)}>
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent>
          Da li ste sigurni da želite obrisati ovu narudžbu? Ova akcija se ne može poništiti.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={busy}>
            Odustani
          </Button>
          <Button onClick={onDelete} color="error" variant="contained" disabled={busy}>
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
