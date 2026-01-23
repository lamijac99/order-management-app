"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [ime, setIme] = useState("");
  const [adresa, setAdresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ime, adresa } },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setInfo("Provjeri email za potvrdu naloga, pa se onda uloguj.");
      router.push("/auth/login");
      return;
    }

    router.refresh();
    router.push("/orders");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Registracija</Typography>

      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        <TextField label="Ime" value={ime} onChange={(e) => setIme(e.target.value)} required />
        <TextField label="Adresa" value={adresa} onChange={(e) => setAdresa(e.target.value)} />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Lozinka" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <Typography color="error">{error}</Typography>}
        {info && <Typography color="primary">{info}</Typography>}

        <Button type="submit" variant="contained">Registruj se</Button>
        <Button variant="text" onClick={() => router.push("/auth/login")}>Već imam nalog</Button>
      </Box>
    </Container>
  );
}
