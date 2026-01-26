"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreateOrderInput = {
  proizvod_id: string;
  kolicina: number;
  adresa_isporuke?: string;
  korisnik_id?: string;
};

export async function createOrderAction(input: CreateOrderInput) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me, error: meErr } = await supabase
      .from("korisnici")
      .select("id, role, ime")
      .eq("id", user.id)
      .single();

    if (meErr || !me) return { ok: false, error: "Ne mogu učitati korisnika." };

    const proizvodId = String(input?.proizvod_id ?? "").trim();
    if (!proizvodId) return { ok: false, error: "Proizvod je obavezan." };

    const kolicina = Number(input?.kolicina);
    if (!Number.isFinite(kolicina)) return { ok: false, error: "Količina mora biti broj." };
    if (kolicina < 1) return { ok: false, error: "Količina mora biti najmanje 1." };
    if (!Number.isInteger(kolicina)) return { ok: false, error: "Količina mora biti cijeli broj." };

    const adresa = String(input?.adresa_isporuke ?? "").trim();
    if (!adresa) return { ok: false, error: "Adresa isporuke je obavezna." };
    if (adresa.length < 5) return { ok: false, error: "Adresa isporuke je prekratka." };

    const { data: proizvod, error: pErr } = await supabase
      .from("proizvodi")
      .select("id, naziv, cijena")
      .eq("id", proizvodId)
      .single();

    if (pErr || !proizvod) return { ok: false, error: "Proizvod nije pronađen." };

    const cijena_po_komadu = Number(proizvod.cijena ?? 0);
    if (!Number.isFinite(cijena_po_komadu) || cijena_po_komadu < 0) {
      return { ok: false, error: "Neispravna cijena proizvoda." };
    }

    let targetUserId = user.id;
    let kupacIme = String(me.ime ?? "(bez kupca)");

    if (me.role === "admin") {
      const picked = String(input?.korisnik_id ?? "").trim();
      if (!picked) return { ok: false, error: "Kupac je obavezan (admin)." };

      const { data: pickedUser, error: puErr } = await supabase
        .from("korisnici")
        .select("id, ime, role")
        .eq("id", picked)
        .single();

      if (puErr || !pickedUser) return { ok: false, error: "Izabrani kupac nije pronađen." };
      if (pickedUser.role === "admin") return { ok: false, error: "Ne možeš izabrati admina kao kupca." };

      targetUserId = pickedUser.id;
      kupacIme = String(pickedUser.ime ?? "(bez kupca)");
    }

    const { data: inserted, error: insErr } = await supabase
      .from("narudzbe")
      .insert({
        proizvod_id: proizvodId,
        korisnik_id: targetUserId,
        kolicina,
        cijena_po_komadu,
        adresa_isporuke: adresa,
        status: "KREIRANA",
      })
      .select("id")
      .single();

    if (insErr || !inserted?.id) return { ok: false, error: insErr?.message || "Greška pri kreiranju narudžbe." };

    const orderId = String(inserted.id);

    await supabase.from("narudzbe_logovi").insert({
      narudzba_id: orderId,
      narudzba_ref: orderId,
      kupac_ref: kupacIme,
      user_id: user.id,
      akcija: "CREATED",
      opis: "Kreirana narudžba",
    });

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}
