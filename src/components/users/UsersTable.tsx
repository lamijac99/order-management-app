"use client";

import { useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export type UserRole = "admin" | "user";

export type UserRow = {
  id: string;
  ime: string;
  email: string;
  role: UserRole;
};

function roleChip(role: UserRole) {
  if (role === "admin") return { label: "ADMIN", color: "warning" as const };
  return { label: "USER", color: "default" as const };
}

export default function UsersTable({
  rows,
  myUserId,
}: {
  rows: UserRow[];
  myUserId: string;
}) {
  const [localRows, setLocalRows] = useState<UserRow[]>(rows);
  useEffect(() => setLocalRows(rows), [rows]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{
    id: string;
    from: UserRole;
    to: UserRole;
    ime: string;
    email: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const columns: GridColDef<UserRow>[] = useMemo(() => {
    return [
      { field: "ime", headerName: "Ime", flex: 1, minWidth: 160 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
      {
        field: "role",
        headerName: "Uloga",
        width: 240,
        sortable: true,
        renderCell: (params) => {
          const current = params.value as UserRole;
          const row = params.row as UserRow;

          const isSelf = row.id === myUserId;
          const c = roleChip(current);

          const select = (
            <Select
              size="small"
              value={current}
              disabled={isSelf}
              onChange={(e) => {
                const next = e.target.value as UserRole;
                if (next === current) return;

                if (isSelf) {
                  setToast({ type: "error", msg: "Ne možete promijeniti svoju ulogu." });
                  return;
                }

                setPending({
                  id: row.id,
                  from: current,
                  to: next,
                  ime: row.ime,
                  email: row.email,
                });
                setConfirmOpen(true);
              }}
              sx={{ height: 34, minWidth: 110 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </Select>
          );

          return (
            <Box
              sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Chip label={c.label} color={c.color} size="small" sx={{ fontWeight: 800 }} />

              {isSelf ? (
                <Tooltip title="Ne možete promijeniti svoju ulogu">
                  <Box>{select}</Box>
                </Tooltip>
              ) : (
                select
              )}

              {isSelf && (
                <Typography variant="caption" sx={{ opacity: 0.7, ml: 0.5, whiteSpace: "nowrap" }}>
                  (vi)
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: "id",
        headerName: "ID",
        width: 180,
        renderCell: (params) => {
          const v = String(params.value ?? "");
          const short = v.length > 12 ? `${v.slice(0, 4)}…${v.slice(-4)}` : v;
          return <span title={v}>{short}</span>;
        },
      },
    ];
  }, [myUserId]);

  const doUpdate = async () => {
    if (!pending) return;

    if (pending.id === myUserId) {
      setToast({ type: "error", msg: "Ne možete promijeniti svoju ulogu." });
      setPending(null);
      setConfirmOpen(false);
      return;
    }

    const { id, from, to } = pending;

    setSaving(true);
    setConfirmOpen(false);

    setLocalRows((prev) => prev.map((u) => (u.id === id ? { ...u, role: to } : u)));

    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: to }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Forbidden");

      setToast({ type: "success", msg: `Uloga promijenjena: ${from} → ${to}` });
    } catch (e: any) {
      setLocalRows((prev) => prev.map((u) => (u.id === id ? { ...u, role: from } : u)));
      setToast({ type: "error", msg: e?.message || "Greška pri promjeni uloge" });
    } finally {
      setSaving(false);
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
        open={confirmOpen}
        onClose={() => {
          if (saving) return;
          setConfirmOpen(false);
          setPending(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Potvrda promjene uloge</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>Da li ste sigurni da želite promijeniti ulogu korisniku:</Typography>

          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "grey.100" }}>
            <Typography fontWeight={800}>{pending?.ime}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {pending?.email}
            </Typography>
          </Box>

          <Typography sx={{ mt: 1.25 }}>
            Sa <b>{pending?.from}</b> na <b>{pending?.to}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setPending(null);
            }}
            disabled={saving}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={doUpdate} disabled={saving}>
            Potvrdi
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
