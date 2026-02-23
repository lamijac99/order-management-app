import { redirect } from "next/navigation";
import Container from "@mui/material/Container";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import OrdersClient from "@/app/orders/OrdersClient";

export const dynamic = "force-dynamic";

export type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";

export type OrderRow = {
  id: string;
  datum_kreiranja: string;
  proizvod: string;
  kupac: string;
  kolicina: number;
  cijena_po_komadu: number;
  adresa_isporuke: string;
  status: OrderStatus;
};

export type ProductOption = { id: string; naziv: string; cijena: number };
export type CustomerOption = { id: string; ime: string };

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("korisnici").select("id, role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";

  
  const { data: ordersData } = await supabase
    .from("narudzbe")
    .select(
      `
      id,
      datum_kreiranja,
      kolicina,
      cijena_po_komadu,
      adresa_isporuke,
      status,
      proizvod:proizvodi ( naziv ),
      kupac:korisnici ( ime )
    `
    )
    .order("datum_kreiranja", { ascending: false })
    .limit(500);

  const rows: OrderRow[] =
    (ordersData ?? []).map((o: any) => ({
      id: String(o.id),
      datum_kreiranja: String(o.datum_kreiranja ?? ""),
      proizvod: String(o?.proizvod?.naziv ?? ""),
      kupac: String(o?.kupac?.ime ?? ""),
      kolicina: Number(o.kolicina ?? 0),
      cijena_po_komadu: Number(o.cijena_po_komadu ?? 0),
      adresa_isporuke: String(o.adresa_isporuke ?? ""),
      status: (String(o.status ?? "KREIRANA") as OrderStatus) ?? "KREIRANA",
    })) ?? [];

  const { data: productsData } = await supabase.from("proizvodi").select("id, naziv, cijena").order("naziv");

  const products: ProductOption[] =
    (productsData ?? []).map((p: any) => ({
      id: String(p.id),
      naziv: String(p.naziv ?? ""),
      cijena: Number(p.cijena ?? 0),
    })) ?? [];

  let customers: CustomerOption[] = [];
  if (isAdmin) {
    const { data: customersData } = await supabase
      .from("korisnici")
      .select("id, ime, role")
      .eq("role", "user")
      .order("ime");

    customers =
      (customersData ?? []).map((c: any) => ({
        id: String(c.id),
        ime: String(c.ime ?? ""),
      })) ?? [];
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <OrdersClient rows={rows} isAdmin={isAdmin} products={products} customers={customers} />
    </Container>
  );
}
