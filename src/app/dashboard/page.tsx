import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { GridLegacy as Grid } from "@mui/material";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import OrdersLineChart from "@/components/dashboard/OrdersLineChart";
import OrdersHistogramChart from "@/components/dashboard/OrdersHistogramChart";
import OrdersByStatusChart from "@/components/dashboard/OrdersByStatusChart";
import TopProductsDonut from "@/components/dashboard/TopProductsDonut";

export const dynamic = "force-dynamic";

type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";
const STATUSES: OrderStatus[] = ["KREIRANA", "U_OBRADI", "POSLATA", "ISPORUCENA", "OTKAZANA"];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatKM(n: number) {
  return `${Number(n || 0).toLocaleString("bs-BA", { maximumFractionDigits: 2 })} KM`;
}

function actionChip(akcija: string) {
  const a = String(akcija ?? "").toUpperCase();

  if (a.includes("DELETE") || a.includes("OBRIS")) return { label: akcija, color: "error" as const };
  if (a.includes("STATUS") || a.includes("UPDATE") || a.includes("EDIT") || a.includes("IZMIJ"))
    return { label: akcija, color: "warning" as const };
  if (a.includes("CREATE") || a.includes("KREIR")) return { label: akcija, color: "success" as const };

  return { label: akcija, color: "default" as const };
}

function chipStyle(color?: "error" | "warning" | "success" | "default") {
  switch (color) {
    case "error":
      return { bgcolor: "rgba(211,47,47,0.2)", color: "error.main" };
    case "warning":
      return { bgcolor: "rgba(237,108,2,0.2)", color: "warning.main" };
    case "success":
      return { bgcolor: "rgba(46,125,50,0.2)", color: "success.main" };
    default:
      return { bgcolor: "rgba(0,0,0,0.08)", color: "text.primary" };
  }
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // ===== COUNTS BY STATUS =====
  const countsEntries = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase
        .from("narudzbe")
        .select("id", { count: "exact", head: true })
        .eq("status", s);

      return [s, count ?? 0] as const;
    })
  );

  const countsByStatus = Object.fromEntries(countsEntries) as Record<OrderStatus, number>;

  // ===== LAST 200 ORDERS =====
  const { data: last200 } = await supabase
    .from("narudzbe")
    .select(
      `
      kolicina,
      cijena_po_komadu,
      datum_kreiranja,
      proizvodi ( id, naziv )
    `
    )
    .order("datum_kreiranja", { ascending: false })
    .limit(200);

  const safeLast200 = (last200 ?? []).map((o: any) => {
    const p = Array.isArray(o.proizvodi) ? o.proizvodi[0] : o.proizvodi;
    const k = Number(o.kolicina ?? 0);
    const c = Number(o.cijena_po_komadu ?? 0);

    return {
      proizvodId: p?.id ?? "",
      proizvodNaziv: p?.naziv ?? "(bez proizvoda)",
      total: k * c,
      kolicina: k,
      datum: String(o.datum_kreiranja ?? ""),
    };
  });

  // ===== TOP PRODUCTS (TOP 5) =====
  const productMap = new Map<string, { naziv: string; count: number; komada: number }>();

  for (const o of safeLast200) {
    const key = o.proizvodId || o.proizvodNaziv;
    const prev = productMap.get(key) ?? { naziv: o.proizvodNaziv, count: 0, komada: 0 };

    productMap.set(key, {
      naziv: prev.naziv,
      count: prev.count + 1,
      komada: prev.komada + o.kolicina,
    });
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ===== HISTOGRAM =====
  const totals = safeLast200.map((x) => x.total);
  const EDGES = [0, 100, 250, 500, 1000, 2000, 5000, 10000];

  const histogram = Array.from({ length: EDGES.length }, (_, i) => {
    const start = EDGES[i];
    const end = EDGES[i + 1];
    const label = end !== undefined ? `${start}–${end}` : `${start}+`;

    const count =
      end !== undefined
        ? totals.filter((t) => t >= start && t < end).length
        : totals.filter((t) => t >= start).length;

    return { label, count };
  });

  // ===== LINE SERIES =====
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 29);

  const dayCounts = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(fromDate);
    d.setDate(fromDate.getDate() + i);
    dayCounts.set(isoDate(d), 0);
  }

  for (const o of safeLast200) {
    const d = o.datum.slice(0, 10);
    if (dayCounts.has(d)) dayCounts.set(d, (dayCounts.get(d) ?? 0) + 1);
  }

  const lineSeries = Array.from(dayCounts.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // ===== ACTIVITIES (mini, compact) =====
  const { data: logs } = await supabase
    .from("narudzbe_logovi")
    .select(
      `
      id,
      akcija,
      created_at,
      narudzba_id,
      narudzba_ref
    `
    )
    .order("created_at", { ascending: false })
    .limit(7); // ✅ ograničeno da fino stane uz donut

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
          Dashboard
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.75 }}>
          Pregled narudžbi – trendovi, statusi i top proizvodi.
        </Typography>
      </Box>

      {/* ===== OVERVIEW ===== */}
      <Typography component="h2" variant="subtitle2" sx={{ mb: 1.5 }}>
        Overview
      </Typography>

      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <OrdersLineChart data={lineSeries} title="Narudžbe po danima" subtitle="Zadnjih 30 dana" />
        </Grid>

        <Grid item xs={12} md={6}>
          <OrdersHistogramChart data={histogram} title="Vrijednost narudžbi" subtitle="Zadnjih 200 narudžbi" />
        </Grid>
      </Grid>

      {/* ===== DETAILS ===== */}
      <Typography component="h2" variant="subtitle2" sx={{ mb: 1.5 }}>
        Details
      </Typography>

      <Grid container spacing={2} columns={12} alignItems="stretch">
        <Grid item xs={12} lg={4}>
          <TopProductsDonut items={topProducts} title="Top proizvodi" />
        </Grid>

        <Grid item xs={12} lg={4}>
          <OrdersByStatusChart countsByStatus={countsByStatus} title="Status narudžbi" />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 180,
              bgcolor: "background.paper",
            }}
          >
            <Typography component="h2" variant="subtitle2" sx={{ mb: 1 }}>
              Aktivnosti
            </Typography>

            <Divider sx={{ mb: 1.25 }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
              }}
            >
              {(logs ?? []).length === 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Nema aktivnosti
                </Typography>
              )}

              {(logs ?? []).map((log: any) => {
                const akcija = String(log?.akcija ?? "");
                const chip = actionChip(akcija);

                const orderId = String(log?.narudzba_id ?? "");
                const orderRef = String(log?.narudzba_ref ?? "");

                const showOrder = orderRef || orderId || "-";
                const shortOrder =
                  showOrder && showOrder.length > 14 ? `${showOrder.slice(0, 5)}…${showOrder.slice(-5)}` : showOrder;

                return (
                  <Box
                    key={log.id}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={chip.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          height: 24,
                          ...chipStyle(chip.color),
                        }}
                      />

                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {log?.created_at ? new Date(log.created_at).toLocaleString("bs-BA") : ""}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 0.75 }}>
                      Narudžba:{" "}
                      {orderId ? (
                        <a
                          href={`/orders/${orderId}`}
                          style={{ fontWeight: 800, textDecoration: "underline", color: "inherit" }}
                        >
                          {shortOrder}
                        </a>
                      ) : (
                        <b>{shortOrder}</b>
                      )}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ mt: 0.5 }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}