import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DeleteOrderButton from "@/components/orders/DeleteOrderButton";
import EditOrderButton from "@/components/orders/EditOrderButton";

type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";

function statusColors(status: OrderStatus) {
  switch (status) {
    case "KREIRANA":
      return { bg: "#e3f2fd", fg: "#0d47a1" };
    case "U_OBRADI":
      return { bg: "#fff8e1", fg: "#e65100" };
    case "POSLATA":
      return { bg: "#e8f5e9", fg: "#1b5e20" };
    case "ISPORUCENA":
      return { bg: "#ede7f6", fg: "#311b92" };
    case "OTKAZANA":
      return { bg: "#ffebee", fg: "#b71c1c" };
  }
}

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") return notFound();

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("narudzbe")
    .select(
      `
      id,
      kolicina,
      cijena_po_komadu,
      status,
      datum_kreiranja,
      adresa_isporuke,
      proizvodi ( id, naziv, cijena ),
      korisnici ( id, ime )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return notFound();
    console.error("Order details fetch error:", error?.message);
    return notFound();
  }

  const status = data.status as OrderStatus;
  const colors = statusColors(status);

  const proizvod = Array.isArray(data.proizvodi) ? data.proizvodi[0] : data.proizvodi;
  const korisnik = Array.isArray(data.korisnici) ? data.korisnici[0] : data.korisnici;

  const proizvodNaziv = proizvod?.naziv ?? "(bez proizvoda)";
  const kupacIme = korisnik?.ime ?? "(bez kupca)";
  const kolicina = Number(data.kolicina ?? 0);
  const cijena = Number(data.cijena_po_komadu ?? 0);
  const ukupno = kolicina * cijena;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <EditOrderButton
  orderId={data.id}
  initialKolicina={kolicina}
  initialAdresa={data.adresa_isporuke ?? ""}
/>


        <DeleteOrderButton orderId={data.id} />
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
            ID:
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
            {data.id}
          </Typography>

          <Chip
            label={status}
            sx={{
              ml: "auto",
              bgcolor: colors.bg,
              color: colors.fg,
              fontWeight: 700,
              borderRadius: 1.5,
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gap: 1.2 }}>
          <Typography>
            <b>Proizvod:</b> {proizvodNaziv}
          </Typography>
          <Typography>
            <b>Kupac:</b> {kupacIme}
          </Typography>
          <Typography>
            <b>Količina:</b> {kolicina}
          </Typography>
          <Typography>
            <b>Cijena po komadu:</b> {cijena.toFixed(2)}
          </Typography>
          <Typography>
            <b>Ukupno:</b> {ukupno.toFixed(2)}
          </Typography>
          <Typography>
            <b>Adresa isporuke:</b> {String(data.adresa_isporuke ?? "") || "-"}
          </Typography>
          <Typography>
            <b>Datum kreiranja:</b> {String(data.datum_kreiranja).replace("T", " ").replace("Z", "")}
          </Typography>
        </Box>
      </Paper>

      <Link href="/orders" style={{ textDecoration: "none" }}>
        <Button variant="outlined" sx={{ mt: 2, ml: "auto", display: "block" }}>
          Nazad na narudžbe
        </Button>
      </Link>
    </Container>
  );
}