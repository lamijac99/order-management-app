"use client";

import { useEffect, useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
};

export default function TopAppBar() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

        if (mounted) setIsAdmin(korisnik?.role === "admin");
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

  const navItems = useMemo<NavItem[]>(() => {
    if (!session) {
      return [
        { label: "Login", href: "/auth/login", icon: <LoginIcon /> },
        { label: "Registracija", href: "/auth/register", icon: <PersonAddAltIcon /> },
      ];
    }

    return [
      { label: "Narudžbe", href: "/orders", icon: <ReceiptLongIcon /> },
      { label: "Nova narudžba", href: "/orders/new", icon: <AddIcon /> },

      { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, adminOnly: true },
      { label: "Logovi", href: "/logs", icon: <ListAltIcon />, adminOnly: true },
      { label: "Korisnici", href: "/users", icon: <PeopleIcon />, adminOnly: true },
    ];
  }, [session]);

  const go = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1 }}>
        {/* Left: hamburger on mobile */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        )}

        
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={() => router.push("/")}
        >
          Orders App
        </Typography>

       
        {!isMobile && (
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
                    whiteSpace: "nowrap",
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
        )}

        {/* Right: mobile quick action */}
        {isMobile && session && (
          <IconButton
            color="inherit"
            onClick={() => router.push("/orders/new")}
            aria-label="Nova narudžba"
          >
            <AddIcon />
          </IconButton>
        )}

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 280 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Meni
            </Typography>
            {session?.user?.email && (
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                {session.user.email}
              </Typography>
            )}
          </Box>

          <Divider />

          <List>
            {navItems
              .filter((x) => !x.adminOnly || isAdmin)
              .map((item) => (
                <ListItemButton key={item.href} onClick={() => go(item.href)}>
                  {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
          </List>

          <Box sx={{ mt: "auto" }}>
            <Divider />
            <List>
              {session ? (
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              ) : null}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
