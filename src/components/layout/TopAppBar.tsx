"use client";

import { useEffect, useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Badge, { badgeClasses } from "@mui/material/Badge";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

import ColorModeIconDropdown from "@/components/theme/ColorModeIconDropdown";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
};

interface MenuButtonProps extends IconButtonProps {
  showBadge?: boolean;
}
function MenuButton({ showBadge = false, ...props }: MenuButtonProps) {
  return (
    <Badge
      color="error"
      variant="dot"
      invisible={!showBadge}
      sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
    >
      <IconButton size="small" {...props} />
    </Badge>
  );
}

function BrandIcon() {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <DashboardRoundedIcon sx={{ fontSize: 20 }} />
    </Box>
  );
}

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
      { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, adminOnly: true },
      { label: "Logovi", href: "/logs", icon: <ListAltIcon />, adminOnly: true },
      { label: "Korisnici", href: "/users", icon: <PeopleIcon />, adminOnly: true },
      { label: "Proizvodi", href: "/products", icon: <InventoryIcon />, adminOnly: true },
    ];
  }, [session]);

  const go = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper", // ✅ nema “sivkaste”, prati temu (light/dark)
          color: "text.primary",
          backgroundImage: "none",
        
          borderBottom: "1px solid",
          borderColor: "divider",
          top: 0,
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
       <Toolbar
  variant="regular"
  sx={{
    minHeight: 48,      // ✅ uže kao template
    px: 1.5,
    py: 0.5,            // ✅ manje vertikalnog paddinga
    gap: 1,
  }}
>
          {/* Left: hamburger on mobile */}
          {isMobile && (
            <MenuButton aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
              <MenuRoundedIcon />
            </MenuButton>
          )}

          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <BrandIcon />
            <Typography
              variant="h5"
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "var(--font-geist-sans), Inter, sans-serif",
              }}
              onClick={() => router.push("/")}
            >
              OrdersApp
            </Typography>
          </Box>

          {/* Mobile: theme toggle */}
          {isMobile && <ColorModeIconDropdown />}

          {/* Desktop nav */}
          {!isMobile && (
            <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
              {/* ✅ theme toggle “sunce/mjesec” */}
              <ColorModeIconDropdown />

              {session ? (
                <>
                  <Button
                    variant="text"
                    onClick={() => router.push("/orders")}
                    sx={{ fontWeight: 600, textTransform: "none" }}
                  >
                    Narudžbe
                  </Button>

                  {isAdmin && (
                    <>
                      <Button
                        variant="text"
                        onClick={() => router.push("/dashboard")}
                        sx={{ textTransform: "none" }}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => router.push("/logs")}
                        sx={{ textTransform: "none" }}
                      >
                        Logovi
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => router.push("/users")}
                        sx={{ textTransform: "none" }}
                      >
                        Korisnici
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => router.push("/products")}
                        sx={{ textTransform: "none" }}
                      >
                        Proizvodi
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outlined"
                    onClick={logout}
                    startIcon={<LogoutIcon />}
                    sx={{ ml: 0.5, borderRadius: "8px", textTransform: "none" }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => router.push("/auth/login")}
                    startIcon={<LoginIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/auth/register")}
                    startIcon={<PersonAddAltIcon />}
                    sx={{ borderRadius: "8px", textTransform: "none" }}
                  >
                    Registracija
                  </Button>
                </>
              )}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundImage: "none",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Meni
          </Typography>
          {session?.user?.email && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {session.user.email}
            </Typography>
          )}
        </Box>

        <Divider />

        <List sx={{ p: 1 }}>
          {navItems
            .filter((x) => !x.adminOnly || isAdmin)
            .map((item) => (
              <ListItemButton key={item.href} onClick={() => go(item.href)}>
                {item.icon && <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
        </List>

        <Box sx={{ mt: "auto" }}>
          <Divider />
          <List sx={{ p: 1 }}>
            {session ? (
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            ) : null}
          </List>
        </Box>
      </Drawer>
    </>
  );
}