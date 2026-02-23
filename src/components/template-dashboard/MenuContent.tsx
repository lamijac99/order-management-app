"use client";

import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { usePathname, useRouter } from "next/navigation";

type Item = { text: string; href: string; icon: React.ReactNode; adminOnly?: boolean };

const items: Item[] = [
  { text: "Narudžbe", href: "/orders", icon: <ReceiptLongIcon /> },
  { text: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, adminOnly: true },
  { text: "Logovi", href: "/logs", icon: <ListAltIcon />, adminOnly: true },
  { text: "Korisnici", href: "/users", icon: <PeopleIcon />, adminOnly: true },
  { text: "Proizvodi", href: "/products", icon: <InventoryIcon />, adminOnly: true },
];

export default function MenuContent({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const visible = items.filter((x) => !x.adminOnly || isAdmin);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {visible.map((item) => {
          const selected =
            pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <ListItem key={item.href} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  router.push(item.href);
                  onNavigate?.();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}