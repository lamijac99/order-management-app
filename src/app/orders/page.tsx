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

const DEFAULT_PAGE_SIZE = 10;
const ALLOWED_PAGE_SIZES = new Set([10, 20, 50, 100]);

function parseStatus(v: unknown): OrderStatus | "ALL" {
  const s = String(v ?? "ALL");
  if (s === "ALL") return "ALL";
  if (["KREIRANA", "U_OBRADI", "POSLATA", "ISPORUCENA", "OTKAZANA"].includes(s)) return s as OrderStatus;
  return "ALL";
}

function parsePage(v: unknown): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function parsePageSize(v: unknown): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  if (!Number.isFinite(n)) return DEFAULT_PAGE_SIZE;
  const nn = Math.floor(n);
  return ALLOWED_PAGE_SIZES.has(nn) ? nn : DEFAULT_PAGE_SIZE;
}

function baseSelect() {
  return `
    id,
    kolicina,
    cijena_po_komadu,
    status,
    datum_kreiranja,
    adresa_isporuke,
    proizvodi ( naziv ),
    korisnici ( ime )
  `;
}

async function getOrders(args: {
  status: OrderStatus | "ALL";
  q: string;
  page: number;
  pageSize: number;
}): Promise<{ rows: OrderRow[]; total: number; isAdmin: boolean }> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";

  let query = supabase.from("narudzbe").select(baseSelect(), { count: "exact" });

  if (!isAdmin) {
    query = query.eq("korisnik_id", user.id);
  }

  if (args.status !== "ALL") {
    query = query.eq("status", args.status);
  }

  const qTrim = isAdmin ? args.q.trim() : "";
  const qEsc = qTrim.replace(/[(),]/g, "");

  if (qEsc) {
    const supabase2 = supabase;
    const [usersRes, productsRes] = await Promise.all([
      supabase2.from("korisnici").select("id").ilike("ime", `%${qEsc}%`).limit(50),
      supabase2.from("proizvodi").select("id").ilike("naziv", `%${qEsc}%`).limit(50),
    ]);

    const userIds = (usersRes.data ?? []).map((x: any) => x.id);
    const productIds = (productsRes.data ?? []).map((x: any) => x.id);

    const orParts: string[] = [`adresa_isporuke.ilike.*${qEsc}*`];

  if (userIds.length) {
    orParts.push(`korisnik_id.in.(${userIds.join(",")})`);
  }
  if (productIds.length) {
    orParts.push(`proizvod_id.in.(${productIds.join(",")})`);
  }

  query = query.or(orParts.join(","));
}
  query = query.order("datum_kreiranja", { ascending: false });

  const from = (args.page - 1) * args.pageSize;
  const to = from + args.pageSize - 1;
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
  const page = parsePage(sp.page);
  const pageSize = parsePageSize(sp.pageSize);

  const { rows: orders, total, isAdmin } = await getOrders({ status, q, page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 1200, mb: 2 }}>
          <OrdersFilters status={status} q={q} showCustomerSearch={isAdmin} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          <OrdersTable rows={orders} isAdmin={isAdmin} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 1200, display: "flex", justifyContent: "center", mt: 1 }}>
          <OrdersPagination page={page} totalPages={totalPages} pageSize={pageSize} />
        </Box>
      </Box>

      <CreateOrderFab />
    </Container>
  );
}