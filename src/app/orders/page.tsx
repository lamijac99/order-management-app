import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import OrdersTable from "@/components/orders/OrdersTable";
import OrdersFilters from "@/components/orders/OrdersFilters";
import OrdersPagination from "@/components/orders/OrdersPagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreateOrderFab from "@/components/orders/CreateOrderFab";

export const dynamic = "force-dynamic";

export type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";

export type OrderRow = {
  id: string;
  proizvod: string;
  kupac: string;
  kolicina: number;
  cijena_po_komadu: number;
  status: OrderStatus;
  datum_kreiranja: string;
  adresa_isporuke: string;
};

type SortKey = "datum_desc" | "datum_asc" | "ukupno_desc" | "ukupno_asc" | "kupac_asc" | "kupac_desc";

const PAGE_SIZE = 5;

function parseStatus(v: unknown): OrderStatus | "ALL" {
  const s = String(v ?? "ALL");
  if (s === "ALL") return "ALL";
  if (["KREIRANA", "U_OBRADI", "POSLATA", "ISPORUCENA", "OTKAZANA"].includes(s)) return s as OrderStatus;
  return "ALL";
}

function parseSort(v: unknown): SortKey {
  const s = String(v ?? "datum_desc") as SortKey;
  const allowed: SortKey[] = ["datum_desc", "datum_asc", "ukupno_desc", "ukupno_asc", "kupac_asc", "kupac_desc"];
  return allowed.includes(s) ? s : "datum_desc";
}

function parsePage(v: unknown): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function baseSelect(innerKorisnici: boolean) {
  return `
    id,
    kolicina,
    cijena_po_komadu,
    status,
    datum_kreiranja,
    adresa_isporuke,
    proizvodi ( naziv ),
    ${innerKorisnici ? "korisnici!inner ( ime )" : "korisnici ( ime )"}
  `;
}

async function getOrders(args: {
  status: OrderStatus | "ALL";
  q: string;
  sort: SortKey;
  page: number;
}): Promise<{ rows: OrderRow[]; total: number; isAdmin: boolean }> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me, error: meErr } = await supabase.from("korisnici").select("role").eq("id", user.id).single();

  if (meErr) console.error("Role fetch error:", meErr.message);

  const isAdmin = me?.role === "admin";

  const qTrim = isAdmin ? args.q.trim() : "";
  const useInner = Boolean(qTrim);

  let query = supabase.from("narudzbe").select(baseSelect(useInner), { count: "exact" });

  if (!isAdmin) {
    query = query.eq("korisnik_id", user.id);
  }

  if (args.status !== "ALL") query = query.eq("status", args.status);

  if (qTrim) query = query.ilike("korisnici.ime", `%${qTrim}%`);

  const sortKey =
    !isAdmin && (args.sort === "kupac_asc" || args.sort === "kupac_desc") ? "datum_desc" : args.sort;

  switch (sortKey) {
    case "datum_desc":
      query = query.order("datum_kreiranja", { ascending: false });
      break;
    case "datum_asc":
      query = query.order("datum_kreiranja", { ascending: true });
      break;
    case "kupac_asc":
      query = query.order("korisnici(ime)", { ascending: true });
      break;
    case "kupac_desc":
      query = query.order("korisnici(ime)", { ascending: false });
      break;
    case "ukupno_desc":
      query = query.order("cijena_po_komadu", { ascending: false }).order("kolicina", { ascending: false });
      break;
    case "ukupno_asc":
      query = query.order("cijena_po_komadu", { ascending: true }).order("kolicina", { ascending: true });
      break;
  }

  const from = (args.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Orders fetch error:", error.message);
    return { rows: [], total: 0, isAdmin };
  }

  const rows: OrderRow[] = (data ?? []).map((o: any) => {
    const proizvod = Array.isArray(o.proizvodi) ? o.proizvodi[0] : o.proizvodi;
    const korisnik = Array.isArray(o.korisnici) ? o.korisnici[0] : o.korisnici;

    return {
      id: o.id,
      proizvod: proizvod?.naziv ?? "(bez proizvoda)",
      kupac: korisnik?.ime ?? "(bez kupca)",
      kolicina: o.kolicina ?? 0,
      cijena_po_komadu: Number(o.cijena_po_komadu ?? 0),
      status: o.status as OrderStatus,
      datum_kreiranja: o.datum_kreiranja,
      adresa_isporuke: o.adresa_isporuke ?? "",
    };
  });

  return { rows, total: count ?? 0, isAdmin };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const q = String(sp.q ?? "");
  const sort = parseSort(sp.sort);
  const page = parsePage(sp.page);

  const { rows: orders, total, isAdmin } = await getOrders({ status, q, sort, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 1200, mb: 2 }}>
          <OrdersFilters status={status} q={q} sort={sort} showCustomerSearch={isAdmin} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          <OrdersTable rows={orders} isAdmin={isAdmin} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 1200, display: "flex", justifyContent: "center", mt: 1 }}>
          <OrdersPagination page={page} totalPages={totalPages} />
        </Box>
      </Box>

      <CreateOrderFab />
    </Container>
  );
}
