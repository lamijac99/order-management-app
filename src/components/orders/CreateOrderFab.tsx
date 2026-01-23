"use client";

import { useRouter } from "next/navigation";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

export default function CreateOrderFab() {
  const router = useRouter();

  return (
    <Tooltip title="Kreiraj narudžbu" placement="left">
      <Fab
        color="primary"
        aria-label="kreiraj narudzbu"
        onClick={() => router.push("/orders/new")}
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
  );
}
