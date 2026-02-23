import { redirect } from "next/navigation";
import Container from "@mui/material/Container";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import UsersClient from "@/app/users/UsersClient";

export const dynamic = "force-dynamic";

export type UserRow = {
  id: string;
  ime: string;
  email: string;
  role: "admin" | "user";
  datum_kreiranja: string | null;
};

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";
  if (!isAdmin) redirect("/orders");

  const { data } = await supabase
    .from("korisnici")
    .select("id, ime, email, role, datum_kreiranja")
    .order("datum_kreiranja", { ascending: false });

  const rows: UserRow[] =
    (data ?? []).map((k: any) => ({
      id: String(k.id),
      ime: String(k.ime ?? ""),
      email: String(k.email ?? ""),
      role: (k.role === "admin" ? "admin" : "user") as "admin" | "user",
      datum_kreiranja: k.datum_kreiranja ?? null,
    })) ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <UsersClient rows={rows} myUserId={user.id} />
    </Container>
  );
}