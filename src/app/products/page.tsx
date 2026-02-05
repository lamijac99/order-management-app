import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductsTable from "@/components/products/ProductsTable";

export const dynamic = "force-dynamic";

export type ProductRow = {
  id: string;
  naziv: string;
  cijena: number;
};

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";
  if (!isAdmin) redirect("/orders");

  const { data } = await supabase.from("proizvodi").select("id, naziv, cijena").order("naziv");

  const rows: ProductRow[] =
    (data ?? []).map((p: any) => ({
      id: String(p.id),
      naziv: String(p.naziv ?? ""),
      cijena: Number(p.cijena ?? 0),
    })) ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Proizvodi
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Upravljanje proizvodima - dodavanje, editovanje i brisanje.
        </Typography>
      </Box>

      <ProductsTable rows={rows} />
    </Container>
  );
}

