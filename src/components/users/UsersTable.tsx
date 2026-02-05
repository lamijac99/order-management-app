"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { createUserAction, updateUserAction, deleteUserAction } from "@/app/users/actions";

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
  const router = useRouter();
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

  const [createOpen, setCreateOpen] = useState(false);
  const [createIme, setCreateIme] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<UserRole>("user");
  const [createLoading, setCreateLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editIme, setEditIme] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
              sx={{ display: "flex", gap: 0.5, justifyContent: "center", width: "100%" }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Tooltip title="Uredi">
                <IconButton
                  size="small"
                  aria-label="Uredi korisnika"
                  onClick={() => {
                    setEditUser(row);
                    setEditIme(row.ime);
                    setEditEmail(row.email);
                    setEditRole(row.role);
                    setEditOpen(true);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={isSelf ? "Ne možete obrisati sebe" : "Obriši"}>
                <span>
                  <IconButton
                    size="small"
                    aria-label="Obriši korisnika"
                    onClick={() => {
                      setDeleteUser(row);
                      setDeleteOpen(true);
                    }}
                    disabled={isSelf}
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
      const res = await updateUserAction({
        userId: id,
        ime: pending.ime,
        email: pending.email,
        role: to,
      });

      if (!res.ok) throw new Error(res.error || "Forbidden");

      setToast({ type: "success", msg: `Uloga promijenjena: ${from} → ${to}` });
      router.refresh();
    } catch (e: any) {
      setLocalRows((prev) => prev.map((u) => (u.id === id ? { ...u, role: from } : u)));
      setToast({ type: "error", msg: e?.message || "Greška pri promjeni uloge" });
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const doCreate = async () => {
    if (!createIme.trim() || createIme.length < 2) {
      setToast({ type: "error", msg: "Ime mora imati najmanje 2 karaktera." });
      return;
    }
    if (!createEmail.trim() || !createEmail.includes("@")) {
      setToast({ type: "error", msg: "Neispravan email." });
      return;
    }
    if (!createPassword.trim() || createPassword.length < 6) {
      setToast({ type: "error", msg: "Lozinka mora imati najmanje 6 karaktera." });
      return;
    }

    setCreateLoading(true);

    try {
      const res = await createUserAction({
        ime: createIme.trim(),
        email: createEmail.trim().toLowerCase(),
        password: createPassword.trim(),
        role: createRole,
      });

      if (!res.ok) {
        setToast({ type: "error", msg: res.error || "Greška pri kreiranju korisnika." });
        return;
      }

      setToast({ type: "success", msg: "Korisnik je uspješno kreiran." });
      setCreateOpen(false);
      setCreateIme("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("user");
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri kreiranju korisnika." });
    } finally {
      setCreateLoading(false);
    }
  };

  const doEdit = async () => {
    if (!editUser) return;

    if (!editIme.trim() || editIme.length < 2) {
      setToast({ type: "error", msg: "Ime mora imati najmanje 2 karaktera." });
      return;
    }
    if (!editEmail.trim() || !editEmail.includes("@")) {
      setToast({ type: "error", msg: "Neispravan email." });
      return;
    }

    setEditLoading(true);

    try {
      const res = await updateUserAction({
        userId: editUser.id,
        ime: editIme.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
      });

      if (!res.ok) {
        setToast({ type: "error", msg: res.error || "Greška pri ažuriranju korisnika." });
        return;
      }

      setToast({ type: "success", msg: "Korisnik je ažuriran." });
      setEditOpen(false);
      setEditUser(null);
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri ažuriranju korisnika." });
    } finally {
      setEditLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteUser) return;

    if (deleteUser.id === myUserId) {
      setToast({ type: "error", msg: "Ne možete obrisati sebe." });
      setDeleteOpen(false);
      setDeleteUser(null);
      return;
    }

    setDeleteLoading(true);

    try {
      const res = await deleteUserAction(deleteUser.id);

      if (!res.ok) {
        setToast({ type: "error", msg: res.error || "Greška pri brisanju korisnika." });
        return;
      }

      setLocalRows((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setToast({ type: "success", msg: "Korisnik je obrisan." });
      setDeleteOpen(false);
      setDeleteUser(null);
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Greška pri brisanju korisnika." });
    } finally {
      setDeleteLoading(false);
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

      <Tooltip title="Kreiraj korisnika" placement="left">
        <Fab
          color="primary"
          aria-label="kreiraj korisnika"
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

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kreiraj korisnika</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Ime"
              value={createIme}
              onChange={(e) => setCreateIme(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Lozinka"
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              fullWidth
              required
              helperText="Najmanje 6 karaktera"
            />
            <TextField
              select
              label="Uloga"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as UserRole)}
              fullWidth
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
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

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi korisnika</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Ime"
              value={editIme}
              onChange={(e) => setEditIme(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              label="Uloga"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              fullWidth
              disabled={editUser?.id === myUserId}
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
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
          <Typography>
            Da li ste sigurni da želite obrisati korisnika <b>{deleteUser?.ime}</b> ({deleteUser?.email})?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "error.main" }}>
            Ova akcija je nepovratna. Korisnik će biti obrisan iz Auth sistema i iz baze podataka.
          </Typography>
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
