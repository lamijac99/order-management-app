import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED = ["KREIRANA", "U_OBRADI", "POSLATA", "ISPORUCENA", "OTKAZANA"] as const;
type OrderStatus = (typeof ALLOWED)[number];

export async function PATCH(req: Request, context: { params: { id?: string } }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me, error: meErr } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
  if (meErr) return NextResponse.json({ error: meErr.message }, { status: 400 });
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const idFromUrl = pathParts[pathParts.indexOf("orders") + 1];
  const id = context?.params?.id ?? idFromUrl;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Missing order id", id }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as OrderStatus | undefined;

  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status", received: status, allowed: ALLOWED },
      { status: 400 }
    );
  }

  const { data: order, error: oErr } = await supabase
    .from("narudzbe")
    .select(`id, status, korisnik_id, korisnici ( ime )`)
    .eq("id", id)
    .single();

  if (oErr || !order) return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });

  const oldStatus = String(order.status ?? "");
  const kupac =
    Array.isArray((order as any).korisnici) ? String((order as any).korisnici?.[0]?.ime ?? "") : String((order as any).korisnici?.ime ?? "");

  const { error } = await supabase.from("narudzbe").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("narudzbe_logovi").insert({
    narudzba_id: id,
    narudzba_ref: String(id),
    kupac_ref: kupac || "(bez kupca)",
    user_id: user.id,
    akcija: "STATUS_CHANGED",
    opis: `Status promijenjen: ${oldStatus} → ${status}`,
  });

  return NextResponse.json({ ok: true });
}
