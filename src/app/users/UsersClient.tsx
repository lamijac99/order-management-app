"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import MenuButton from "@/components/template-dashboard/MenuButton";
import UsersTable, { type UserRow, type UserRole } from "@/components/users/UsersTable";
import { createUserAction } from "@/app/users/actions";

export default function UsersClient({
  rows,
  myUserId,
}: {
  rows: UserRow[];
  myUserId: string;
}) {
  const router = useRouter();

  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createIme, setCreateIme] = React.useState("");
  const [createEmail, setCreateEmail] = React.useState("");
  const [createPassword, setCreatePassword] = React.useState("");
  const [createRole, setCreateRole] = React.useState<UserRole>("user");
  const [createLoading, setCreateLoading] = React.useState(false);

  const safe = {
    setToast: (v: { type: "success" | "error"; msg: string } | null) => mountedRef.current && setToast(v),
    setCreateOpen: (v: boolean) => mountedRef.current && setCreateOpen(v),
    setCreateIme: (v: string) => mountedRef.current && setCreateIme(v),
    setCreateEmail: (v: string) => mountedRef.current && setCreateEmail(v),
    setCreatePassword: (v: string) => mountedRef.current && setCreatePassword(v),
    setCreateRole: (v: UserRole) => mountedRef.current && setCreateRole(v),
    setCreateLoading: (v: boolean) => mountedRef.current && setCreateLoading(v),
  };

  const resetCreate = () => {
    safe.setCreateIme("");
    safe.setCreateEmail("");
    safe.setCreatePassword("");
    safe.setCreateRole("user");
  };

  const doCreate = async () => {
    const ime = createIme.trim();
    const email = createEmail.trim().toLowerCase();
    const password = createPassword.trim();

    if (!ime || ime.length < 2) return safe.setToast({ type: "error", msg: "Ime mora imati najmanje 2 karaktera." });
    if (!email || !email.includes("@")) return safe.setToast({ type: "error", msg: "Neispravan email." });
    if (!password || password.length < 6) return safe.setToast({ type: "error", msg: "Lozinka mora imati najmanje 6 karaktera." });

    safe.setCreateLoading(true);
    try {
      const res = await createUserAction({ ime, email, password, role: createRole });
      if (!res.ok) return safe.setToast({ type: "error", msg: res.error || "Greška pri kreiranju korisnika." });

      safe.setToast({ type: "success", msg: "Korisnik je uspješno kreiran." });
      safe.setCreateOpen(false);
      resetCreate();
      router.refresh();
    } catch (e: any) {
      safe.setToast({ type: "error", msg: e?.message || "Greška pri kreiranju korisnika." });
    } finally {
      safe.setCreateLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Korisnici
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Admin može mijenjati ulogu korisnika (admin/user).
          </Typography>
        </Box>

        <Tooltip title="Kreiraj korisnika">
          <span>
            <MenuButton aria-label="Kreiraj korisnika" onClick={() => safe.setCreateOpen(true)} disabled={createLoading}>
              <AddRoundedIcon fontSize="small" />
            </MenuButton>
          </span>
        </Tooltip>
      </Stack>

      <UsersTable rows={rows} myUserId={myUserId} onToast={safe.setToast} />

      <Dialog
        open={createOpen}
        onClose={() => (createLoading ? null : safe.setCreateOpen(false))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Kreiraj korisnika</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Ime"
              value={createIme}
              onChange={(e) => safe.setCreateIme(e.target.value)}
              fullWidth
              required
              disabled={createLoading}
            />
            <TextField
              label="Email"
              type="email"
              value={createEmail}
              onChange={(e) => safe.setCreateEmail(e.target.value)}
              fullWidth
              required
              disabled={createLoading}
            />
            <TextField
              label="Lozinka"
              type="password"
              value={createPassword}
              onChange={(e) => safe.setCreatePassword(e.target.value)}
              fullWidth
              required
              helperText="Najmanje 6 karaktera"
              disabled={createLoading}
            />
            <TextField
              select
              label="Uloga"
              value={createRole}
              onChange={(e) => safe.setCreateRole(e.target.value as UserRole)}
              fullWidth
              disabled={createLoading}
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              safe.setCreateOpen(false);
              resetCreate();
            }}
            disabled={createLoading}
          >
            Odustani
          </Button>
          <Button variant="contained" onClick={doCreate} disabled={createLoading}>
            Kreiraj
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => safe.setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.type} onClose={() => safe.setToast(null)} variant="filled" sx={{ width: "100%" }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}