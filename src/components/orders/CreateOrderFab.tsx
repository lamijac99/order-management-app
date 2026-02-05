"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AddIcon from "@mui/icons-material/Add";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import OrderForm from "@/components/orders/OrderForm";

type Proizvod = { id: string; naziv: string; cijena: number };
type UserOption = { id: string; ime: string; email: string };

export default function CreateOrderFab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          router.push("/auth/login");
          return;
        }

        const { data: me } = await supabase
          .from("korisnici")
          .select("role")
          .eq("id", session.session.user.id)
          .single();

        const admin = me?.role === "admin";
        setIsAdmin(admin);

        const { data: proizvodiData } = await supabase
          .from("proizvodi")
          .select("id, naziv, cijena")
          .order("naziv");

        setProizvodi((proizvodiData ?? []).map((p: any) => ({
          id: String(p.id),
          naziv: String(p.naziv ?? ""),
          cijena: Number(p.cijena ?? 0),
        })));

        if (admin) {
          const { data: usersData } = await supabase
            .from("korisnici")
            .select("id, ime, email, role")
            .eq("role", "user")
            .order("ime");

          setUsers((usersData ?? []).map((u: any) => ({
            id: String(u.id),
            ime: String(u.ime ?? ""),
            email: String(u.email ?? ""),
          })));
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, router]);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Tooltip title="Kreiraj narudžbu" placement="left">
        <Fab
          color="primary"
          aria-label="kreiraj narudzbu"
          onClick={() => setOpen(true)}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova narudžba</DialogTitle>
        <DialogContent>
          {loading ? (
            <div>Učitavanje...</div>
          ) : (
            <OrderForm
              key={open ? "open" : "closed"}
              proizvodi={proizvodi}
              isAdmin={isAdmin}
              users={users}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
