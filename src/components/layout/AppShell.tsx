"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

import TopAppBar from "@/components/layout/TopAppBar";


import SideMenu from "@/components/template-dashboard/SideMenu";

import AppNavbar from "@/components/template-dashboard/AppNavbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();

  const [session, setSession] = React.useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const isAuthRoute = pathname?.startsWith("/auth");

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session);

      if (data.session?.user) {
        const { data: korisnik } = await supabase
          .from("korisnici")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
        if (!mounted) return;
        setIsAdmin(korisnik?.role === "admin");
      } else {
        setIsAdmin(false);
      }

      setReady(true);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  
  if (isAuthRoute) {
    return (
      <>
        <TopAppBar />
        {children}
      </>
    );
  }

  
  if (!ready) {
    return (
      <>
        <TopAppBar />
        {children}
      </>
    );
  }

  
  if (!session) {
    return (
      <>
        <TopAppBar />
        {children}
      </>
    );
  }

 
  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      {/* Desktop side menu */}
      <SideMenu session={session} isAdmin={isAdmin} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
       
        <AppNavbar session={session} isAdmin={isAdmin} />

        
        <Box
          component="main"
          sx={{
            p: 2,
            pt: { xs: 10, md: 2 }, 
            maxWidth: { md: "1700px" },
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}