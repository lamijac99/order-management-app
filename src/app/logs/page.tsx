import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import LogsTable from "@/components/logs/LogsTable";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type LogRow = {
  id: string;
  created_at: string;
  akcija: string;
  opis: string | null;
  narudzba_id: string | null;
  narudzba_ref: string | null;
  kupac_ref: string | null;
  kupac: string;
};

async function getLogs(): Promise<LogRow[]> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("narudzbe_logovi")
    .select(
      `
      id,
      created_at,
      akcija,
      opis,
      narudzba_id,
      narudzba_ref,
      kupac_ref
    `
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Logs fetch error:", error.message);
    return [];
  }

  return (data ?? []).map((l: any) => {
    const narudzba_id = l.narudzba_id ? String(l.narudzba_id) : null;

    return {
      id: String(l.id),
      created_at: String(l.created_at),
      akcija: String(l.akcija ?? ""),
      opis: l.opis ?? null,
      narudzba_id,
      narudzba_ref: l.narudzba_ref ? String(l.narudzba_ref) : null,
      kupac_ref: l.kupac_ref ? String(l.kupac_ref) : null,
      kupac: String(l.kupac_ref ?? "(bez kupca)"),
    };
  });
}

export default async function LogsPage() {
  const logs = await getLogs();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Logovi
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Pregled zadnjih promjena u sistemu.
        </Typography>
      </Box>

      <LogsTable rows={logs} />
    </Container>
  );
}