"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function createUserAction(input: {
  ime: string;
  email: string;
  password: string;
  role: "admin" | "user";
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return { ok: false, error: "Samo admin može kreirati korisnike." };

    const ime = String(input?.ime ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase();
    const password = String(input?.password ?? "").trim();
    const role = input?.role === "admin" ? "admin" : "user";

    if (!ime || ime.length < 2) return { ok: false, error: "Ime mora imati najmanje 2 karaktera." };
    if (!email || !email.includes("@")) return { ok: false, error: "Neispravan email." };
    if (!password || password.length < 6) return { ok: false, error: "Lozinka mora imati najmanje 6 karaktera." };

    const adminSupabase = getSupabaseAdmin();

    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { ime },
    });

    if (authError || !authUser.user) {
      return { ok: false, error: authError?.message || "Greška pri kreiranju korisnika u Auth." };
    }

    const userId = authUser.user.id;

    const { error: dbError } = await adminSupabase
  .from("korisnici")
  .upsert(
    { id: userId, ime, email, role },
    { onConflict: "id" }
  );

    if (dbError) {
      await adminSupabase.auth.admin.deleteUser(userId);
      return { ok: false, error: dbError.message || "Greška pri kreiranju korisnika u bazi." };
    }

    return { ok: true, userId };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}

export async function updateUserAction(input: {
  userId: string;
  ime: string;
  email: string;
  role?: "admin" | "user";
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me } = await supabase.from("korisnici").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return { ok: false, error: "Samo admin može ažurirati korisnike." };

    if (user.id === input.userId) {
      return { ok: false, error: "Ne možete mijenjati svoje podatke ovdje." };
    }

    const userId = String(input?.userId ?? "").trim();
    const ime = String(input?.ime ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase();

    if (!userId || userId === "undefined") return { ok: false, error: "Neispravan ID korisnika." };
    if (!ime || ime.length < 2) return { ok: false, error: "Ime mora imati najmanje 2 karaktera." };
    if (!email || !email.includes("@")) return { ok: false, error: "Neispravan email." };

    const adminSupabase = getSupabaseAdmin();

    const { error: authUpdateError } = await adminSupabase.auth.admin.updateUserById(userId, {
      email,
      user_metadata: { ime },
    });
    if (authUpdateError) {
      return { ok: false, error: authUpdateError.message || "Greška pri ažuriranju korisnika u Auth." };
    }

    const updateData: any = { ime, email };
    if (input.role !== undefined) {
      updateData.role = input.role;
    }

    const { error: dbError } = await adminSupabase.from("korisnici").update(updateData).eq("id", userId);

    if (dbError) {
      return { ok: false, error: dbError.message || "Greška pri ažuriranju korisnika u bazi." };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Greška na serveru." };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Niste ulogovani." };

    const { data: me } = await supabase
      .from("korisnici")
      .select("role")
      .eq("id", user.id)
      .single();

    if (me?.role !== "admin") {
      return { ok: false, error: "Samo admin može brisati korisnike." };
    }

    const id = String(userId ?? "").trim();
    if (!id || id === "undefined") {
      return { ok: false, error: "Neispravan ID korisnika." };
    }

    if (user.id === id) {
      return { ok: false, error: "Ne možete obrisati sebe." };
    }

    const adminSupabase = getSupabaseAdmin();

    const { error: authError } = await adminSupabase.auth.admin.deleteUser(id);
    if (authError) {
      return {
        ok: false,
        error: `Auth delete error: ${authError.message}`,
      };
    }

    const { error: dbError } = await adminSupabase
      .from("korisnici")
      .delete()
      .eq("id", id);

    if (dbError) {
      return {
        ok: false,
        error: `Database delete error: ${dbError.message}`,
      };
    }

    return { ok: true };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message || "Greška na serveru.",
    };
  }
}