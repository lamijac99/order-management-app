import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niste ulogovani." }, { status: 401 });
    }

    if (user.id === id) {
      return NextResponse.json(
        { error: "Ne možete promijeniti svoju ulogu." },
        { status: 403 }
      );
    }

    const { data: me, error: meErr } = await supabase
      .from("korisnici")
      .select("role")
      .eq("id", user.id)
      .single();

    if (meErr) {
      return NextResponse.json({ error: meErr.message }, { status: 400 });
    }

    if (me?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const role = String(body?.role ?? "").trim() as "admin" | "user";

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Neispravna uloga." }, { status: 400 });
    }

    const { error } = await supabase.from("korisnici").update({ role }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Greška na serveru." },
      { status: 500 }
    );
  }
}
