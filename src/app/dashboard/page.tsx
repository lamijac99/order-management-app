import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import TopProducts from "@/components/dashboard/TopProducts";
import StatusCards from "@/components/dashboard/StatusCards";

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

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const countsEntries = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase.from("narudzbe").select("id", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    })
  );

  const countsByStatus = Object.fromEntries(countsEntries) as Record<OrderStatus, number>;
  const totalAll = Object.values(countsByStatus).reduce((a, b) => a + b, 0);

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
    .slice(0, 8);

  const totals = safeLast200.map((x) => x.total);
  const max = totals.length ? Math.max(...totals) : 1;
  const bins = 8;
  const step = Math.ceil(max / bins);

  const histogram = Array.from({ length: bins }, (_, i) => ({
    label: `${i * step}–${(i + 1) * step}`,
    count: totals.filter((t) => t >= i * step && t < (i + 1) * step).length,
  }));

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

  const lineSeries = Array.from(dayCounts.entries()).map(([date, count]) => ({ date, count }));

  const totalValue30 = totals.reduce((a, b) => a + b, 0);
  const avgOrder30 = totals.length ? totalValue30 / totals.length : 0;

  const { data: logs } = await supabase
    .from("narudzbe_logovi")
    .select(
      `
      id,
      akcija,
      opis,
      created_at,
      narudzba_id,
      narudzba_ref,
      kupac_ref
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 2,
        minHeight: "100vh",
        bgcolor: "#E0F2FE",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Dashboard
      </Typography>

      <Box sx={{ mb: 2 }}>
        <StatusCards totalAll={totalAll} countsByStatus={countsByStatus} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "450px 1fr 260px" },
          gridTemplateRows: "270px 270px",
          alignItems: "stretch",
        }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            gridColumn: 1,
            gridRow: "1 / 3",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#eeeeee",
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Aktivnosti
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              overflowY: "auto",
              flex: 1,
            }}
          >
            {(logs ?? []).length === 0 && (
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Nema aktivnosti
              </Typography>
            )}

            {(logs ?? []).map((log: any) => {
              const akcija = String(log?.akcija ?? "");
              const chip = actionChip(akcija);

              const orderId = String(log?.narudzba_id ?? "");
              const orderRef = String(log?.narudzba_ref ?? "");
              const kupacRef = String(log?.kupac_ref ?? "");

              const showOrder = orderRef || orderId;
              const shortOrder =
                showOrder && showOrder.length > 12 ? `${showOrder.slice(0, 4)}…${showOrder.slice(-4)}` : showOrder;

              return (
                <Box
                  key={log.id}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "grey.100",
                    fontSize: 13,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Chip label={chip.label} color={chip.color} size="small" sx={{ fontWeight: 700 }} />

                    <Typography variant="caption" sx={{ opacity: 0.6, whiteSpace: "nowrap" }}>
                      {new Date(log.created_at).toLocaleString("bs-BA")}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 0.75 }}>
                    {log.opis}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mt: 0.75 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Narudžba:{" "}
                      {showOrder ? (
                        orderId ? (
                          <a
                            href={`/orders/${orderId}`}
                            title={orderId}
                            style={{ fontWeight: 800, textDecoration: "underline", color: "inherit" }}
                          >
                            {shortOrder}
                          </a>
                        ) : (
                          <span title={showOrder} style={{ fontWeight: 800 }}>
                            {shortOrder}
                          </span>
                        )
                      ) : (
                        <span style={{ opacity: 0.6 }}>-</span>
                      )}
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      Kupac: <b>{kupacRef || "-"}</b>
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, gridColumn: 2, gridRow: 1 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Vrijednost narudžbi
          </Typography>
          <DashboardCharts histogram={histogram} />
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            gridColumn: 3,
            gridRow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
            Top proizvodi (zadnjih 200)
          </Typography>
          <TopProducts items={topProducts} />
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, gridColumn: 2, gridRow: 2 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Narudžbe po danima
          </Typography>
          <DashboardCharts line={lineSeries} />
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            gridColumn: 3,
            gridRow: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
            Sažetak (30 dana)
          </Typography>
          <Box sx={{ display: "grid", gap: 0.5, width: "100%" }}>
            <Typography sx={{ textAlign: "center" }}>
              Ukupno: <b>{formatKM(totalValue30)}</b>
            </Typography>
            <Typography sx={{ textAlign: "center" }}>
              Prosjek: <b>{formatKM(avgOrder30)}</b>
            </Typography>
            <Typography sx={{ textAlign: "center" }}>
              Broj narudžbi: <b>{totals.length}</b>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
