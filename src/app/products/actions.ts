"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createProductAction(input: { naziv: string; cijena: number }) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return { ok: false, error: "Samo admin može kreirati proizvode." };

    const naziv = String(input?.naziv ?? "").trim();
    const cijena = Number(input?.cijena ?? 0);

    if (!naziv || naziv.length < 2) return { ok: false, error: "Naziv mora imati najmanje 2 karaktera." };
    if (!Number.isFinite(cijena) || cijena < 0) return { ok: false, error: "Cijena mora biti pozitivan broj." };

    const { data, error } = await supabase
      .from("proizvodi")
      .insert({ naziv, cijena })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message || "Greška pri kreiranju proizvoda." };

    revalidatePath("/products");
    return { ok: true, productId: data.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}

export async function updateProductAction(input: { productId: string; naziv: string; cijena: number }) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return { ok: false, error: "Samo admin može ažurirati proizvode." };

    const productId = String(input?.productId ?? "").trim();
    const naziv = String(input?.naziv ?? "").trim();
    const cijena = Number(input?.cijena ?? 0);

    if (!productId || productId === "undefined") return { ok: false, error: "Neispravan ID proizvoda." };
    if (!naziv || naziv.length < 2) return { ok: false, error: "Naziv mora imati najmanje 2 karaktera." };
    if (!Number.isFinite(cijena) || cijena < 0) return { ok: false, error: "Cijena mora biti pozitivan broj." };

    const { error } = await supabase.from("proizvodi").update({ naziv, cijena }).eq("id", productId);

    if (error) return { ok: false, error: error.message || "Greška pri ažuriranju proizvoda." };

    revalidatePath("/products");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return { ok: false, error: "Samo admin može brisati proizvode." };

    const id = String(productId ?? "").trim();
    if (!id || id === "undefined") return { ok: false, error: "Neispravan ID proizvoda." };

    const { data: orders } = await supabase.from("narudzbe").select("id").eq("proizvod_id", id).limit(1);
    if (orders && orders.length > 0) {
      return { ok: false, error: "Ne možete obrisati proizvod koji ima narudžbe." };
    }

    const { error } = await supabase.from("proizvodi").delete().eq("id", id);
    if (error) return { ok: false, error: error.message || "Greška pri brisanju proizvoda." };

    revalidatePath("/products");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}