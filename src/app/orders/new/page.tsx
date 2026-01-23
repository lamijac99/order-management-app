import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import OrderForm from "@/components/orders/OrderForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me, error: meErr } = await supabase
    .from("korisnici")
    .select("role")
    .eq("id", user.id)
    .single();

  if (meErr) console.error("Role fetch error:", meErr.message);

  const isAdmin = me?.role === "admin";

  const { data: proizvodi } = await supabase
    .from("proizvodi")
    .select("id, naziv, cijena")
    .order("naziv");

  const { data: users } = isAdmin
    ? await supabase
        .from("korisnici")
        .select("id, ime, email, role")
        .eq("role", "user")
        .order("ime")
    : { data: [] as any[] };

  return (
    <Container sx={{ py: 4 }}>
      <OrderForm
        proizvodi={proizvodi ?? []}
        isAdmin={isAdmin}
        users={(users ?? []).map((u: any) => ({
          id: String(u.id),
          ime: String(u.ime ?? ""),
          email: String(u.email ?? ""),
        }))}
      />
    </Container>
  );
}
