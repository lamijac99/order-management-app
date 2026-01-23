"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestPage() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("proizvodi").select("*").limit(1);
      if (error) setMsg("Error: " + error.message);
      else setMsg("OK! Connected. Rows: " + (data?.length ?? 0));
    })();
  }, []);

  return <div style={{ padding: 24 }}>{msg}</div>;
}
