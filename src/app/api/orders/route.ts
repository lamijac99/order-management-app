import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    proizvod_id,
    kolicina,
    cijena_po_komadu,
    adresa_isporuke,
  } = body;

  if (!proizvod_id || kolicina <= 0 || cijena_po_komadu < 0) {
    return NextResponse.json({ error: "Neispravni podaci" }, { status: 400 });
  }

  const { error } = await supabase.from("narudzbe").insert({
    proizvod_id,
    korisnik_id: user.id,
    kolicina,
    cijena_po_komadu,
    adresa_isporuke,
    status: "KREIRANA",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
