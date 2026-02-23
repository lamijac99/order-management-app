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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { updateUserAction, deleteUserAction } from "@/app/users/actions";

export type UserRole = "admin" | "user";

export type UserRow = {
  id: string;
  ime: string;
  email: string;
  role: UserRole;
};

export default function UsersTable({
  rows,
  myUserId,
  onToast,
}: {
  rows: UserRow[];
  myUserId: string;
  onToast?: (t: { type: "success" | "error"; msg: string } | null) => void;
}) {
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

  const toast = (t: { type: "success" | "error"; msg: string }) => onToast?.(t);

  const [localRows, setLocalRows] = React.useState<UserRow[]>(rows);
  React.useEffect(() => setLocalRows(rows), [rows]);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState<{
    id: string;
    from: UserRole;
    to: UserRole;
    ime: string;
    email: string;
  } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserRow | null>(null);
  const [editIme, setEditIme] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editRole, setEditRole] = React.useState<UserRole>("user");
  const [editLoading, setEditLoading] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteUser, setDeleteUser] = React.useState<UserRow | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const safe = {
    setLocalRows: (fn: any) => mountedRef.current && setLocalRows(fn),
    setConfirmOpen: (v: boolean) => mountedRef.current && setConfirmOpen(v),
    setPending: (v: any) => mountedRef.current && setPending(v),
    setSaving: (v: boolean) => mountedRef.current && setSaving(v),
    setEditOpen: (v: boolean) => mountedRef.current && setEditOpen(v),
    setEditUser: (v: UserRow | null) => mountedRef.current && setEditUser(v),
    setEditIme: (v: string) => mountedRef.current && setEditIme(v),
    setEditEmail: (v: string) => mountedRef.current && setEditEmail(v),
    setEditRole: (v: UserRole) => mountedRef.current && setEditRole(v),
    setEditLoading: (v: boolean) => mountedRef.current && setEditLoading(v),
    setDeleteOpen: (v: boolean) => mountedRef.current && setDeleteOpen(v),
    setDeleteUser: (v: UserRow | null) => mountedRef.current && setDeleteUser(v),
    setDeleteLoading: (v: boolean) => mountedRef.current && setDeleteLoading(v),
  };

  const columns: GridColDef<UserRow>[] = React.useMemo(() => {
    return [
      { field: "ime", headerName: "Ime", flex: 0.7, minWidth: 140 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
      {
        field: "role",
        headerName: "Uloga",
        width: 160,
        sortable: true,
        renderCell: (params) => {
          const current = params.value as UserRole;
          const row = params.row as UserRow;
          const isSelf = row.id === myUserId;

          return (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Select
                size="small"
                value={current}
                disabled={isSelf || saving}
                onChange={(e) => {
                  const next = e.target.value as UserRole;
                  if (next === current) return;

                  if (isSelf) {
                    toast({ type: "error", msg: "Ne možete promijeniti svoju ulogu." });
                    return;
                  }

                  safe.setPending({
                    id: row.id,
                    from: current,
                    to: next,
                    ime: row.ime,
                    email: row.email,
                  });
                  safe.setConfirmOpen(true);
                }}
                sx={{ height: 34, minWidth: 90 }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <MenuItem value="user">user</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
              </Select>

              {isSelf && (
                <Typography variant="caption" sx={{ opacity: 0.7, whiteSpace: "nowrap" }}>
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
        width: 130,
        renderCell: (params) => {
          const v = String(params.value ?? "");
          const short = v.length > 10 ? `${v.slice(0, 3)}…${v.slice(-3)}` : v;
          return <span title={v}>{short}</span>;
        },
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
          const row = params.row as UserRow;
          const isSelf = row.id === myUserId;

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
                    aria-label="Uredi korisnika"
                    disabled={saving || editLoading || deleteLoading}
                    onClick={() => {
                      safe.setEditUser(row);
                      safe.setEditIme(row.ime);
                      safe.setEditEmail(row.email);
                      safe.setEditRole(row.role);
                      safe.setEditOpen(true);
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={isSelf ? "Ne možete obrisati sebe" : "Obriši"}>
                <span>
                  <IconButton
                    size="small"
                    aria-label="Obriši korisnika"
                    disabled={isSelf || saving || editLoading || deleteLoading}
                    onClick={() => {
                      safe.setDeleteUser(row);
                      safe.setDeleteOpen(true);
                    }}
                  >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [myUserId, saving, editLoading, deleteLoading]);

  const doUpdate = async () => {
    if (!pending) return;

    if (pending.id === myUserId) {
      toast({ type: "error", msg: "Ne možete promijeniti svoju ulogu." });
      safe.setPending(null);
      safe.setConfirmOpen(false);
      return;
    }

    const { id, from, to } = pending;

    safe.setSaving(true);
    safe.setConfirmOpen(false);
    safe.setLocalRows((prev: UserRow[]) => prev.map((u) => (u.id === id ? { ...u, role: to } : u)));

    try {
      const res = await updateUserAction({
        userId: id,
        ime: pending.ime,
        email: pending.email,
        role: to,
      });
      if (!res.ok) throw new Error(res.error || "Forbidden");

      toast({ type: "success", msg: `Uloga promijenjena: ${from} → ${to}` });
      router.refresh();
    } catch (e: any) {
      safe.setLocalRows((prev: UserRow[]) => prev.map((u) => (u.id === id ? { ...u, role: from } : u)));
      toast({ type: "error", msg: e?.message || "Greška pri promjeni uloge" });
    } finally {
      safe.setSaving(false);
      safe.setPending(null);
    }
  };

  const doEdit = async () => {
    if (!editUser) return;

    const ime = editIme.trim();
    const email = editEmail.trim().toLowerCase();

    if (!ime || ime.length < 2) return toast({ type: "error", msg: "Ime mora imati najmanje 2 karaktera." });
    if (!email || !email.includes("@")) return toast({ type: "error", msg: "Neispravan email." });

    safe.setEditLoading(true);
    try {
      const res = await updateUserAction({
        userId: editUser.id,
        ime,
        email,
        role: editRole,
      });

      if (!res.ok) return toast({ type: "error", msg: res.error || "Greška pri ažuriranju korisnika." });

      toast({ type: "success", msg: "Korisnik je ažuriran." });
      safe.setEditOpen(false);
      safe.setEditUser(null);
      router.refresh();
    } catch (e: any) {
      toast({ type: "error", msg: e?.message || "Greška pri ažuriranju korisnika." });
    } finally {
      safe.setEditLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteUser) return;

    if (deleteUser.id === myUserId) {
      toast({ type: "error", msg: "Ne možete obrisati sebe." });
      safe.setDeleteOpen(false);
      safe.setDeleteUser(null);
      return;
    }

    safe.setDeleteLoading(true);
    try {
      const res = await deleteUserAction(deleteUser.id);
      if (!res.ok) return toast({ type: "error", msg: res.error || "Greška pri brisanju korisnika." });

      safe.setLocalRows((prev: UserRow[]) => prev.filter((u) => u.id !== deleteUser.id));
      toast({ type: "success", msg: "Korisnik je obrisan." });
      safe.setDeleteOpen(false);
      safe.setDeleteUser(null);
      router.refresh();
    } catch (e: any) {
      toast({ type: "error", msg: e?.message || "Greška pri brisanju korisnika." });
    } finally {
      safe.setDeleteLoading(false);
    }
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
            
          />
        )}
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (saving) return;
          safe.setConfirmOpen(false);
          safe.setPending(null);
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
              safe.setConfirmOpen(false);
              safe.setPending(null);
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

      <Dialog open={editOpen} onClose={() => safe.setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi korisnika</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Ime"
              value={editIme}
              onChange={(e) => safe.setEditIme(e.target.value)}
              fullWidth
              required
              disabled={editLoading}
            />
            <TextField
              label="Email"
              type="email"
              value={editEmail}
              onChange={(e) => safe.setEditEmail(e.target.value)}
              fullWidth
              required
              disabled={editLoading}
            />
            <TextField
              select
              label="Uloga"
              value={editRole}
              onChange={(e) => safe.setEditRole(e.target.value as UserRole)}
              fullWidth
              disabled={editLoading || editUser?.id === myUserId}
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => safe.setEditOpen(false)} disabled={editLoading}>
            Odustani
          </Button>
          <Button variant="contained" onClick={doEdit} disabled={editLoading}>
            Spasi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => safe.setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent>
          <Typography>
            Da li ste sigurni da želite obrisati korisnika <b>{deleteUser?.ime}</b> ({deleteUser?.email})?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "error.main" }}>
            Ova akcija je nepovratna. Korisnik će biti obrisan iz Auth sistema i iz baze podataka.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => safe.setDeleteOpen(false)} disabled={deleteLoading}>
            Odustani
          </Button>
          <Button color="error" variant="contained" onClick={doDelete} disabled={deleteLoading}>
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}