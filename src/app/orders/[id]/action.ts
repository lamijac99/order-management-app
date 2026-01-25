"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteOrderAction(orderId: string) {
  try {
    if (!orderId || orderId === "undefined") return { ok: false, error: "Neispravan ID narudžbe." };

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: order, error: oErr } = await supabase
      .from("narudzbe")
      .select(`id, status, kolicina, adresa_isporuke, korisnik_id, korisnici ( ime )`)
      .eq("id", orderId)
      .single();

    if (oErr || !order) return { ok: false, error: "Narudžba nije pronađena." };

    const kupac =
      Array.isArray((order as any).korisnici) ? String((order as any).korisnici?.[0]?.ime ?? "") : String((order as any).korisnici?.ime ?? "");

    await supabase.from("narudzbe_logovi").insert({
      narudzba_id: orderId,
      narudzba_ref: String(orderId),
      kupac_ref: kupac || "(bez kupca)",
      user_id: user.id,
      akcija: "DELETED",
      opis: `Obrisana narudžba (status: ${order.status}, količina: ${order.kolicina})`,
    });

    const { error } = await supabase.from("narudzbe").delete().eq("id", orderId);
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}

export type OrderStatus = "KREIRANA" | "U_OBRADI" | "POSLATA" | "ISPORUCENA" | "OTKAZANA";

export async function updateOrderAction(input: { orderId: string; kolicina: number; adresa_isporuke: string }) {
  try {
    const { orderId, kolicina, adresa_isporuke } = input;

    if (!orderId || orderId === "undefined") return { ok: false, error: "Neispravan ID narudžbe." };
    if (!Number.isFinite(kolicina) || kolicina <= 0) return { ok: false, error: "Količina mora biti veća od 0." };

    const adresa = String(adresa_isporuke ?? "").trim();
    if (!adresa) return { ok: false, error: "Adresa isporuke je obavezna." };
    if (adresa.length < 5) return { ok: false, error: "Adresa isporuke je prekratka." };

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { error } = await supabase.from("narudzbe").update({ kolicina, adresa_isporuke: adresa }).eq("id", orderId);
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}
