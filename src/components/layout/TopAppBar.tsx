"use client";

import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import AddIcon from "@mui/icons-material/Add";

export default function TopAppBar() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSessionAndRole = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session);

      if (data.session?.user) {
        const { data: korisnik } = await supabase
          .from("korisnici")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (mounted) {
          setIsAdmin(korisnik?.role === "admin");
        }
      } else {
        setIsAdmin(false);
      }
    };

    loadSessionAndRole();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadSessionAndRole();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.refresh();
    window.location.href = "/auth/login";
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          Orders App
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {session && (
            <>
              
               {isAdmin && (
                <>
                  <Button color="inherit" onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </Button>
                  <Button color="inherit" onClick={() => router.push("/logs")}>
                    Logovi
                  </Button>
                  <Button color="inherit" onClick={() => router.push("/users")}>
                    Korisnici
                  </Button>
                </>
              )}

              <Button color="inherit" onClick={() => router.push("/orders")}>
                Narudžbe
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<AddIcon />}
                onClick={() => router.push("/orders/new")}
                sx={{
                  borderColor: "rgba(255,255,255,0.6)",
                  "&:hover": { borderColor: "rgba(255,255,255,0.9)" },
                }}
              >
                Nova narudžba
              </Button>
            </>
          )}

          {!session ? (
            <>
              <Button color="inherit" onClick={() => router.push("/auth/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => router.push("/auth/register")}>
                Registracija
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
